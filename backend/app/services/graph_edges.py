
import torch


def prepare_graph_edges(
    edge_index,
    edge_weight,
    num_nodes,
    add_self_loops=True
):
    """Original Phase 24 graph self-loop preparation."""

    if not add_self_loops:
        return edge_index, edge_weight

    # Remove existing self-loops to prevent duplicates.
    non_loop_mask = (
        edge_index[0] != edge_index[1]
    )

    edge_index = edge_index[:, non_loop_mask]
    edge_weight = edge_weight[non_loop_mask]

    # Create one self-loop for every node.
    node_ids = torch.arange(
        num_nodes,
        device=edge_index.device
    )

    self_loop_edges = torch.stack(
        [node_ids, node_ids],
        dim=0
    )

    self_loop_weights = torch.ones(
        num_nodes,
        dtype=edge_weight.dtype,
        device=edge_weight.device
    )

    # Append self-loops to the original graph.
    edge_index = torch.cat(
        [edge_index, self_loop_edges],
        dim=1
    )

    edge_weight = torch.cat(
        [edge_weight, self_loop_weights],
        dim=0
    )

    return edge_index, edge_weight
