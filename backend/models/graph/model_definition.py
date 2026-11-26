
import torch
import torch.nn as nn
import torch.nn.functional as F


class GraphAttentionLayer(nn.Module):

    def __init__(self, input_dim, output_dim, heads=4):
        super().__init__()

        assert output_dim % heads == 0

        self.heads = heads
        self.head_dim = output_dim // heads

        self.linear = nn.Linear(
            input_dim, output_dim, bias=False
        )

        self.att_source = nn.Parameter(
            torch.empty(heads, self.head_dim)
        )

        self.att_target = nn.Parameter(
            torch.empty(heads, self.head_dim)
        )

        self.bias = nn.Parameter(
            torch.zeros(output_dim)
        )

        nn.init.xavier_uniform_(self.linear.weight)
        nn.init.xavier_uniform_(self.att_source)
        nn.init.xavier_uniform_(self.att_target)

    def forward(self, x, edge_index, edge_weight):

        num_nodes = x.size(0)
        source, target = edge_index

        h = self.linear(x).view(
            num_nodes, self.heads, self.head_dim
        )

        source_scores = (
            h * self.att_source
        ).sum(dim=-1)

        target_scores = (
            h * self.att_target
        ).sum(dim=-1)

        scores = F.leaky_relu(
            source_scores[source] + target_scores[target],
            negative_slope=0.20
        )

        scores = scores + torch.log(
            edge_weight.clamp_min(1e-8)
        ).unsqueeze(-1)

        target_index = target.unsqueeze(-1).expand(
            -1, self.heads
        )

        max_scores = scores.new_full(
            (num_nodes, self.heads),
            -float("inf")
        )

        max_scores.scatter_reduce_(
            0,
            target_index,
            scores.detach(),
            reduce="amax",
            include_self=True
        )

        exp_scores = torch.exp(
            scores - max_scores[target]
        )

        denominator = scores.new_zeros(
            num_nodes, self.heads
        )

        denominator.scatter_add_(
            0, target_index, exp_scores
        )

        attention = exp_scores / (
            denominator[target] + 1e-12
        )

        messages = (
            h[source] * attention.unsqueeze(-1)
        )

        output = h.new_zeros(
            num_nodes, self.heads, self.head_dim
        )

        output.index_add_(
            0, target, messages
        )

        return output.reshape(num_nodes, -1) + self.bias


class GATEncoder(nn.Module):

    def __init__(
        self,
        input_dim=979,
        hidden_dims=(512, 256, 128),
        heads=4,
        dropout=0.30
    ):
        super().__init__()

        dimensions = [input_dim, *hidden_dims]

        self.attention_layers = nn.ModuleList([
            GraphAttentionLayer(
                dimensions[i],
                dimensions[i + 1],
                heads=heads
            )
            for i in range(len(hidden_dims))
        ])

        self.normalizations = nn.ModuleList([
            nn.LayerNorm(dim)
            for dim in hidden_dims
        ])

        self.dropout = nn.Dropout(dropout)

    def forward(self, x, edge_index, edge_weight):

        for layer, norm in zip(
            self.attention_layers,
            self.normalizations
        ):
            x = layer(x, edge_index, edge_weight)
            x = norm(x)
            x = F.relu(x)
            x = self.dropout(x)

        return x
