
import torch
import torch.nn as nn


class FeatureProjection(nn.Module):

    def __init__(self, input_dim, output_dim):
        super().__init__()

        self.projection = nn.Sequential(
            nn.Linear(input_dim, output_dim),
            nn.LayerNorm(output_dim),
            nn.ReLU()
        )

    def forward(self, x):
        return self.projection(x)


class AdaptiveFeatureFusion(nn.Module):

    def __init__(
        self,
        visual_dim=960,
        morphological_dim=19,
        graph_dim=128,
        fusion_dim=128,
        gate_hidden_dim=128,
        num_classes=4,
        dropout=0.30
    ):
        super().__init__()

        self.visual_projection = FeatureProjection(
            visual_dim, fusion_dim
        )

        self.morphological_projection = FeatureProjection(
            morphological_dim, fusion_dim
        )

        self.graph_projection = FeatureProjection(
            graph_dim, fusion_dim
        )

        self.gating_network = nn.Sequential(
            nn.Linear(fusion_dim * 3, gate_hidden_dim),
            nn.LayerNorm(gate_hidden_dim),
            nn.ReLU(),
            nn.Linear(gate_hidden_dim, 3)
        )

        nn.init.zeros_(self.gating_network[-1].weight)
        nn.init.zeros_(self.gating_network[-1].bias)

        self.fusion_norm = nn.LayerNorm(fusion_dim)
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(fusion_dim, num_classes)

    def encode(self, visual, morphological, graph):

        z_visual = self.visual_projection(visual)
        z_morphological = self.morphological_projection(
            morphological
        )
        z_graph = self.graph_projection(graph)

        combined = torch.cat(
            [z_visual, z_morphological, z_graph],
            dim=-1
        )

        gate_logits = self.gating_network(combined)
        weights = torch.softmax(gate_logits, dim=-1)

        fused = (
            weights[:, 0:1] * z_visual
            + weights[:, 1:2] * z_morphological
            + weights[:, 2:3] * z_graph
        )

        fused = self.fusion_norm(fused)

        return fused, weights

    def forward(self, visual, morphological, graph):

        fused, weights = self.encode(
            visual, morphological, graph
        )

        logits = self.classifier(
            self.dropout(fused)
        )

        return logits, fused, weights
