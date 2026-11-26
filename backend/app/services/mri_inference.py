
from pathlib import Path
import importlib.util

import numpy as np
import torch

from backend.app.services.preprocessing import (
    preprocess_mri,
    prepare_model_input,
)
from backend.app.services.roi_features import (
    extract_mask_guided_roi,
    extract_morphological_features,
)
from backend.app.services.graph_inference import GraphInference
from backend.app.services.graph_edges import prepare_graph_edges


ROOT = Path(__file__).resolve().parents[3]
MODEL_DIR = ROOT / "backend" / "models"

DEVICE = torch.device("cpu")
MASK_THRESHOLD = 0.50

CLASS_NAMES = [
    "glioma",
    "meningioma",
    "pituitary",
    "no_tumor",
]


def load_model_class(path, module_name, class_name):
    """Import each original model definition independently."""

    spec = importlib.util.spec_from_file_location(
        module_name, str(path)
    )

    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot import: {path}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    return getattr(module, class_name)


class MorphoGRAFInference:

    def __init__(self):

        # 1. Segmentation model
        SegmentationModel = load_model_class(
            MODEL_DIR / "segmentation/model_definition.py",
            "morphograf_segmentation",
            "AttentionUNetResNet50",
        )

        self.segmentation = SegmentationModel(
            pretrained=False
        )

        seg_checkpoint = torch.load(
            MODEL_DIR / "segmentation/best_segmentation_model.pt",
            map_location=DEVICE,
            weights_only=True,
        )

        self.segmentation.load_state_dict(
            seg_checkpoint["model_state_dict"],
            strict=True,
        )

        self.segmentation.eval()

        # 2. MobileNetV3-Large
        CNNModel = load_model_class(
            MODEL_DIR / "cnn/model_definition.py",
            "morphograf_cnn",
            "MobileNetV3LargeClassifier",
        )

        self.cnn = CNNModel(
            num_classes=4,
            dropout=0.30,
            pretrained=False,
        )

        cnn_checkpoint = torch.load(
            MODEL_DIR / "cnn/best_model.pt",
            map_location=DEVICE,
            weights_only=True,
        )

        self.cnn.load_state_dict(
            cnn_checkpoint["model_state_dict"],
            strict=True,
        )

        self.cnn.eval()

        # 3. Frozen GAT + GRACE encoder
        GraphModel = load_model_class(
            MODEL_DIR / "graph/model_definition.py",
            "morphograf_graph",
            "GATEncoder",
        )

        self.graph_encoder = GraphModel(
            input_dim=979,
            hidden_dims=(512, 256, 128),
            heads=4,
            dropout=0.30,
        )

        graph_checkpoint = torch.load(
            MODEL_DIR / "graph/frozen_graph_encoder.pt",
            map_location=DEVICE,
            weights_only=True,
        )

        self.graph_encoder.load_state_dict(
            graph_checkpoint["encoder_state_dict"],
            strict=True,
        )

        self.graph_encoder.eval()

        # 4. Adaptive Feature Fusion
        FusionModel = load_model_class(
            MODEL_DIR / "fusion/model_definition.py",
            "morphograf_fusion",
            "AdaptiveFeatureFusion",
        )

        self.fusion = FusionModel(
            visual_dim=960,
            morphological_dim=19,
            graph_dim=128,
            fusion_dim=128,
            gate_hidden_dim=128,
            num_classes=4,
            dropout=0.30,
        )

        fusion_checkpoint = torch.load(
            MODEL_DIR / "fusion/best_model.pt",
            map_location=DEVICE,
            weights_only=True,
        )

        self.fusion.load_state_dict(
            fusion_checkpoint["model_state_dict"],
            strict=True,
        )

        self.fusion.eval()

        # 5. Training reference graph and scalers
        self.graph_inference = GraphInference()

        expected_mapping = {
            name: index
            for index, name in enumerate(CLASS_NAMES)
        }

        if (
            fusion_checkpoint["fusion_config"]["class_mapping"]
            != expected_mapping
        ):
            raise ValueError("Class mapping mismatch")

        print("MorphoGRAF: All components loaded")

    @torch.inference_mode()
    def predict(self, image_path):
        """Run the complete original MRI inference pipeline."""

        # Stage 1: Preprocess MRI
        image = preprocess_mri(image_path)

        # Stage 2: Predict segmentation mask
        image_tensor = prepare_model_input(image)

        segmentation_logits = self.segmentation(
            image_tensor
        )

        mask = (
            torch.sigmoid(segmentation_logits)
            >= MASK_THRESHOLD
        ).to(torch.uint8)

        predicted_mask = (
            mask[0, 0].cpu().numpy() * 255
        ).astype(np.uint8)

        # Stage 3: Extract ROI
        roi_image, roi_metadata = extract_mask_guided_roi(
            image,
            predicted_mask,
        )

        # Stage 4: Extract visual features
        roi_tensor = prepare_model_input(roi_image)

        visual_features = (
            self.cnn.extract_features(roi_tensor)
            .cpu()
            .numpy()
        )

        # Stage 5: Extract morphological features
        morphological_features = (
            extract_morphological_features(
                predicted_mask
            ).reshape(1, 19)
        )

        # Stage 6: Original normalization and balancing
        _, _, combined_features = (
            self.graph_inference.normalize_features(
                visual_features,
                morphological_features,
            )
        )

        # Stage 7: Inductive graph construction
        graph_x, edge_index, edge_weight = (
            self.graph_inference.construct_query_graph(
                combined_features
            )
        )

        # Stage 8: Restore original self-loop policy
        edge_index, edge_weight = prepare_graph_edges(
            edge_index,
            edge_weight,
            graph_x.shape[0],
            add_self_loops=True,
        )

        if not bool(torch.all(edge_weight > 0)):
            raise ValueError("Non-positive graph edge weight")

        graph_embedding = self.graph_encoder(
            graph_x,
            edge_index,
            edge_weight,
        )[-1:].contiguous()

        # Stage 9: Adaptive Fusion
        # Phase 24 uses the balanced combined feature blocks.
        combined_tensor = torch.as_tensor(
            combined_features,
            dtype=torch.float32,
            device=DEVICE,
        )

        fusion_visual = combined_tensor[:, :960]
        fusion_morphological = combined_tensor[:, 960:]

        logits, fused_embedding, gate_weights = (
            self.fusion(
                fusion_visual,
                fusion_morphological,
                graph_embedding,
            )
        )

        probabilities = torch.softmax(
            logits,
            dim=1,
        )

        predicted_class = int(
            torch.argmax(probabilities, dim=1).item()
        )

        return {
            "predicted_class": predicted_class,
            "predicted_label": CLASS_NAMES[predicted_class],
            "confidence": float(
                probabilities[0, predicted_class].item()
            ),
            "class_probabilities": {
                name: float(probabilities[0, index].item())
                for index, name in enumerate(CLASS_NAMES)
            },
            "predicted_mask": predicted_mask,
            "roi_image": roi_image,
            "roi_metadata": roi_metadata,
            "graph_embedding_shape": tuple(
                graph_embedding.shape
            ),
            "fusion_weights": (
                gate_weights[0].cpu().numpy().tolist()
            ),
        }
