use crate::js::models::{HexPosition, RoutePoint};
use crate::render::models::RouteSegment::RouteSegment;
use std::collections::HashMap;

#[derive(Clone, Copy, Hash, PartialEq, Eq)]
struct EdgeKey(HexPosition, HexPosition);

struct Edge {
    vertex_a: usize,
    vertex_b: usize,
    route_ids: Vec<u32>,
}

#[derive(Default)]
struct RouteGraph {
    vertices: Vec<HexPosition>,
    edges: Vec<Edge>,
    adjacency: Vec<Vec<usize>>,
    vertex_indices: HashMap<HexPosition, usize>,
    edge_indices: HashMap<EdgeKey, usize>,
    junction_vertices: Vec<usize>,
    path_segments: Vec<Vec<usize>>,
}

/// Converts sequential route points into unique paths split at junctions.
pub fn segment_routes(route_points: &[RoutePoint]) -> Vec<RouteSegment> {
    let mut graph = RouteGraph::from_route_points(route_points);
    graph.find_path_segments();
    graph.into_route_segments()
}

impl RouteGraph {
    /// Builds a graph from the sequential route points.
    fn from_route_points(route_points: &[RoutePoint]) -> Self {
        let mut graph = Self::default();
        graph.add_route_points(route_points);
        graph
    }

    /// Adds each consecutive same-route waypoint pair as an edge.
    fn add_route_points(&mut self, route_points: &[RoutePoint]) {
        for points in route_points.windows(2) {
            let route_id = points[0].route_id;
            let next_route_id = points[1].route_id;
            let start = points[0].tile_position;
            let end = points[1].tile_position;
            if route_id == next_route_id && start != end {
                self.add_edge(start, end, route_id);
            }
        }
    }

    /// Adds or updates an undirected edge between two positions.
    fn add_edge(&mut self, start: HexPosition, end: HexPosition, route_id: u32) {
        let key = edge_key(start, end);
        if let Some(&edge_index) = self.edge_indices.get(&key) {
            add_unique(&mut self.edges[edge_index].route_ids, route_id);
            return;
        }

        let vertex_a = self.add_vertex(start);
        let vertex_b = self.add_vertex(end);
        let edge_index = self.edges.len();

        self.edges.push(Edge {
            vertex_a,
            vertex_b,
            route_ids: vec![route_id],
        });
        self.adjacency[vertex_a].push(edge_index);
        self.adjacency[vertex_b].push(edge_index);
        self.edge_indices.insert(key, edge_index);
    }

    /// Returns the existing vertex index or creates a new vertex.
    fn add_vertex(&mut self, position: HexPosition) -> usize {
        if let Some(&index) = self.vertex_indices.get(&position) {
            return index;
        }

        let index = self.vertices.len();
        self.vertices.push(position);
        self.adjacency.push(Vec::new());
        self.vertex_indices.insert(position, index);
        index
    }

    /// Finds all maximal paths between junctions and around cycles.
    fn find_path_segments(&mut self) {
        self.junction_vertices = self
            .adjacency
            .iter()
            .enumerate()
            .filter_map(|(vertex, edges)| (edges.len() != 2).then_some(vertex))
            .collect();

        let mut visited_edges = vec![false; self.edges.len()];
        for vertex in self.junction_vertices.clone() {
            self.walk_unvisited_edges(vertex, &mut visited_edges);
        }

        // A connected component made entirely of degree-two vertices is a cycle.
        for edge_index in 0..self.edges.len() {
            if !visited_edges[edge_index] {
                let start = self.edges[edge_index].vertex_a;
                self.walk_edge(start, edge_index, &mut visited_edges);
            }
        }
    }

    /// Starts path walks for all unvisited edges at a junction.
    fn walk_unvisited_edges(&mut self, start_vertex: usize, visited_edges: &mut [bool]) {
        let edge_indices = self.adjacency[start_vertex].clone();
        for edge_index in edge_indices {
            if !visited_edges[edge_index] {
                self.walk_edge(start_vertex, edge_index, visited_edges);
            }
        }
    }

    /// Walks one path until it reaches another junction or a visited edge.
    fn walk_edge(
        &mut self,
        start_vertex: usize,
        first_edge: usize,
        visited_edges: &mut [bool],
    ) {
        let mut path = vec![start_vertex];
        let mut current_vertex = start_vertex;
        let mut edge_index = first_edge;

        loop {
            visited_edges[edge_index] = true;
            let next_vertex = self.other_vertex(edge_index, current_vertex);
            path.push(next_vertex);

            let Some(next_edge) = self.next_edge(next_vertex, visited_edges) else {
                break;
            };

            current_vertex = next_vertex;
            edge_index = next_edge;
        }

        self.path_segments.push(path);
    }

    /// Returns the endpoint opposite the supplied vertex on an edge.
    fn other_vertex(&self, edge_index: usize, vertex: usize) -> usize {
        let edge = &self.edges[edge_index];
        if edge.vertex_a == vertex {
            edge.vertex_b
        } else {
            edge.vertex_a
        }
    }

    /// Finds the unvisited continuation edge at a degree-two vertex.
    fn next_edge(&self, vertex: usize, visited_edges: &[bool]) -> Option<usize> {
        if self.adjacency[vertex].len() != 2 {
            return None;
        }

        self.adjacency[vertex]
            .iter()
            .copied()
            .find(|&edge_index| !visited_edges[edge_index])
    }

    /// Converts discovered vertex paths into renderable route segments.
    fn into_route_segments(mut self) -> Vec<RouteSegment> {
        let path_segments = std::mem::take(&mut self.path_segments);
        path_segments
            .into_iter()
            .map(|path| self.create_route_segment(&path))
            .collect()
    }

    /// Builds one route segment and collects its participating route IDs.
    fn create_route_segment(&self, path: &[usize]) -> RouteSegment {
        let mut route_ids = Vec::new();
        let edge_indices = path
            .windows(2)
            .map(|vertices| self.edge_between(vertices[0], vertices[1]));
        for edge in edge_indices {
            for &route_id in &self.edges[edge].route_ids {
                add_unique(&mut route_ids, route_id);
            }
        }

        RouteSegment {
            points: path.iter().map(|&vertex| self.vertices[vertex]).collect(),
            route_ids,
        }
    }

    /// Looks up the edge connecting two adjacent path vertices.
    fn edge_between(&self, vertex_a: usize, vertex_b: usize) -> usize {
        let start = self.vertices[vertex_a];
        let end = self.vertices[vertex_b];
        self.edge_indices[&edge_key(start, end)]
    }
}

/// Creates a direction-independent key for an edge.
fn edge_key(start: HexPosition, end: HexPosition) -> EdgeKey {
    if (start.q, start.r) <= (end.q, end.r) {
        EdgeKey(start, end)
    } else {
        EdgeKey(end, start)
    }
}

/// Appends a route ID only when it is not already present.
fn add_unique(route_ids: &mut Vec<u32>, route_id: u32) {
    if !route_ids.contains(&route_id) {
        route_ids.push(route_id);
    }
}
