use crate::js::models::{HexPosition, RoutePoint};
use std::collections::HashMap;

#[derive(Clone, Copy, Hash, PartialEq, Eq)]
struct EdgeKey(HexPosition, HexPosition);

#[derive(Default)]
struct RouteGraph {
    positions: Vec<HexPosition>,
    edges: Vec<(usize, usize)>,
    adjacency: Vec<Vec<usize>>,
    edge_indices: HashMap<EdgeKey, usize>,
    position_indices: HashMap<HexPosition, usize>,
}

/// Removes duplicate route segments and splits the result at junctions.
pub fn split_unique_routes(routes: &[&[RoutePoint]]) -> Vec<Vec<HexPosition>> {
    let mut graph = RouteGraph::default();

    for route in routes {
        for points in route.windows(2) {
            let start = points[0].tile_position;
            let end = points[1].tile_position;
            if start == end {
                continue;
            }

            let start_index = node_index(&mut graph, start);
            let end_index = node_index(&mut graph, end);
            let key = edge_key(start, end);

            if graph.edge_indices.contains_key(&key) {
                continue;
            }

            let edge_index = graph.edges.len();
            graph.edges.push((start_index, end_index));
            graph.adjacency[start_index].push(edge_index);
            graph.adjacency[end_index].push(edge_index);
            graph.edge_indices.insert(key, edge_index);
        }
    }

    let mut visited_edges = vec![false; graph.edges.len()];
    let mut unique_routes = Vec::new();

    for node_index in 0..graph.positions.len() {
        if graph.adjacency[node_index].len() == 2 {
            continue;
        }

        for &edge_index in &graph.adjacency[node_index] {
            if !visited_edges[edge_index] {
                unique_routes.push(walk_route(
                    node_index,
                    edge_index,
                    &graph,
                    &mut visited_edges,
                ));
            }
        }
    }

    // A graph made entirely of cycles has no junction from which to start.
    for edge_index in 0..graph.edges.len() {
        if !visited_edges[edge_index] {
            unique_routes.push(walk_route(
                graph.edges[edge_index].0,
                edge_index,
                &graph,
                &mut visited_edges,
            ));
        }
    }

    unique_routes
}

fn node_index(graph: &mut RouteGraph, position: HexPosition) -> usize {
    if let Some(&index) = graph.position_indices.get(&position) {
        return index;
    }

    let index = graph.positions.len();
    graph.positions.push(position);
    graph.adjacency.push(Vec::new());
    graph.position_indices.insert(position, index);
    index
}

fn edge_key(start: HexPosition, end: HexPosition) -> EdgeKey {
    if (start.q, start.r) <= (end.q, end.r) {
        EdgeKey(start, end)
    } else {
        EdgeKey(end, start)
    }
}

fn walk_route(
    start_node: usize,
    first_edge: usize,
    graph: &RouteGraph,
    visited_edges: &mut [bool],
) -> Vec<HexPosition> {
    let mut route = vec![graph.positions[start_node]];
    let mut current_node = start_node;
    let mut current_edge = first_edge;

    loop {
        visited_edges[current_edge] = true;
        let (edge_start, edge_end) = graph.edges[current_edge];
        let next_node = if edge_start == current_node {
            edge_end
        } else {
            edge_start
        };
        route.push(graph.positions[next_node]);

        if graph.adjacency[next_node].len() != 2 {
            break;
        }

        let Some(next_edge) = graph.adjacency[next_node]
            .iter()
            .copied()
            .find(|&edge_index| !visited_edges[edge_index])
        else {
            break;
        };

        current_node = next_node;
        current_edge = next_edge;
    }

    route
}
