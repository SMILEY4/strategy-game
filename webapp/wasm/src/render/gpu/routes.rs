use crate::js::models::HexPosition;
use crate::render::config::Config;
use crate::render::models::gpu::RouteVertex;
use crate::render::models::route_segment::RouteSegment;
use crate::render::state_output::OutputState;
use crate::render::state_render::RenderState;
use crate::render::tools::line_mesh::build_line_mesh;
use crate::render::tools::path_smoothing::smooth_path;

const ROUTE_WIDTH: f32 = 0.2;
const ROUTE_HIGHLIGHT_WIDTH: f32 = 0.3;
const ROUTE_SUBDIVISIONS_PER_SEGMENT: usize = 8;

pub fn build_routes(state: &RenderState, _config: &Config, output: &mut OutputState) {
    output.route_vertices.clear();
    for route_segment in &state.route_segments {
        build_route_segment(route_segment, ROUTE_WIDTH, &mut output.route_vertices);
    }
}

pub fn build_route_highlights(state: &RenderState, _config: &Config, output: &mut OutputState) {
    output.route_highlight_vertices.clear();
    let Some(selected_entity_id) = state.selected_entity_id else {
        return;
    };
    for route_segment in &state.route_segments {
        if route_segment.connected_entity_ids.contains(&selected_entity_id) {
            build_route_segment(route_segment, ROUTE_HIGHLIGHT_WIDTH, &mut output.route_highlight_vertices);
        }
    }
}

/// Converts one deduplicated route segment into a line mesh.
fn build_route_segment(route_segment: &RouteSegment, width: f32, output: &mut Vec<RouteVertex>) {
    let raw_path = build_raw_path(&route_segment.points);
    let smoothed_path = smooth_path(&raw_path, ROUTE_SUBDIVISIONS_PER_SEGMENT);
    let path_length = raw_path.len() as f32;
    let vertices = build_line_mesh(&smoothed_path, width, |vertex_position, texture_coords| {
        RouteVertex {
            vertex_position,
            texture_coords,
            path_length,
        }
    });
    output.extend(vertices);
}

/// Converts route tile positions into world positions.
fn build_raw_path(route: &[HexPosition]) -> Vec<[f32; 2]> {
    route.iter().copied().map(HexPosition::to_world).collect()
}
