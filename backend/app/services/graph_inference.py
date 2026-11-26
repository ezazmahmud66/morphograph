
import json
from pathlib import Path

import joblib
import numpy as np
import torch
import torch.nn.functional as F


# Project paths
PROJECT_ROOT = Path(__file__).resolve().parents[3]

SCALER_DIR = PROJECT_ROOT / "backend/artifacts/scalers"
GRAPH_DIR = PROJECT_ROOT / "backend/artifacts/reference_graph"

VISUAL_DIM = 960
MORPHOLOGICAL_DIM = 19
GRAPH_INPUT_DIM = 979

DEVICE = torch.device("cpu")


class GraphInference:

    def __init__(self):

        # Load original Phase 10 configuration
        with open(
            GRAPH_DIR / "repository_config.json",
            "r",
            encoding="utf-8"
        ) as file:
            self.config = json.load(file)

        graph_config = self.config["graph_configuration"]
        feature_config = self.config["feature_processing"]

        if graph_config["similarity_metric"] != "cosine":
            raise ValueError("Unexpected similarity metric")

        if graph_config["evaluation_graph_type"] != "directed_attachment":
            raise ValueError("Unexpected graph protocol")

        self.k_neighbors = int(
            graph_config["k_neighbors"]
        )

        self.visual_weight = float(
            feature_config["visual_block_weight"]
        )

        self.morphological_weight = float(
            feature_config["morphological_block_weight"]
        )

        # Restore training-fitted scalers
        self.visual_scaler = joblib.load(
            SCALER_DIR / "visual_standard_scaler.joblib"
        )

        self.morphological_scaler = joblib.load(
            SCALER_DIR / "morphological_standard_scaler.joblib"
        )

        if self.visual_scaler.n_features_in_ != VISUAL_DIM:
            raise ValueError("Visual scaler dimension mismatch")

        if self.morphological_scaler.n_features_in_ != MORPHOLOGICAL_DIM:
            raise ValueError("Morphological scaler dimension mismatch")

        # Restore original training reference graph
        graph = torch.load(
            GRAPH_DIR / "train_inductive_graph.pt",
            map_location="cpu",
            weights_only=True
        )

        self.reference_x = graph["x"].to(
            device=DEVICE,
            dtype=torch.float32
        )

        self.reference_edge_index = graph[
            "edge_index"
        ].long().to(DEVICE)

        self.reference_edge_weight = graph[
            "edge_weight"
        ].float().reshape(-1).to(DEVICE)

        if self.reference_x.shape != (16536, GRAPH_INPUT_DIM):
            raise ValueError("Reference graph dimension mismatch")

        if self.reference_edge_index.shape != (2, 109810):
            raise ValueError("Reference edge count mismatch")

        if self.reference_edge_weight.numel() != 109810:
            raise ValueError("Reference edge weight mismatch")

        # Cache normalized reference features
        self.reference_x_normalized = F.normalize(
            self.reference_x,
            p=2,
            dim=1
        )

        self.num_reference_nodes = self.reference_x.shape[0]

    def normalize_features(
        self,
        visual_features,
        morphological_features
    ):
        """Original Phase 24 normalization and balancing."""

        visual = np.asarray(
            visual_features,
            dtype=np.float32
        ).reshape(1, VISUAL_DIM)

        morphological = np.asarray(
            morphological_features,
            dtype=np.float32
        ).reshape(1, MORPHOLOGICAL_DIM)

        normalized_visual = (
            self.visual_scaler.transform(visual)
            .astype(np.float32)
        )

        normalized_morphological = (
            self.morphological_scaler.transform(
                morphological
            ).astype(np.float32)
        )

        combined = np.concatenate(
            [
                normalized_visual * self.visual_weight,
                normalized_morphological * self.morphological_weight
            ],
            axis=1
        )

        return (
            normalized_visual,
            normalized_morphological,
            combined
        )

    @torch.inference_mode()
    def construct_query_graph(self, combined_features):
        """Attach a new MRI node to the training graph."""

        query_x = torch.as_tensor(
            combined_features,
            dtype=torch.float32,
            device=DEVICE
        ).reshape(1, GRAPH_INPUT_DIM)

        query_normalized = F.normalize(
            query_x,
            p=2,
            dim=1
        )

        # Cosine similarities against training nodes
        similarities = (
            self.reference_x_normalized
            @ query_normalized.T
        ).squeeze(1)

        neighbor_weights, neighbor_ids = torch.topk(
            similarities,
            k=self.k_neighbors,
            largest=True,
            sorted=True
        )

        query_node_id = self.num_reference_nodes

        query_targets = torch.full_like(
            neighbor_ids,
            query_node_id
        )

        # Original directed attachment:
        # training neighbors -> query node
        query_edges = torch.stack(
            [neighbor_ids, query_targets],
            dim=0
        )

        graph_x = torch.cat(
            [self.reference_x, query_x],
            dim=0
        )

        edge_index = torch.cat(
            [self.reference_edge_index, query_edges],
            dim=1
        )

        edge_weight = torch.cat(
            [self.reference_edge_weight, neighbor_weights],
            dim=0
        )

        return graph_x, edge_index, edge_weight
