use crate::render::config::Config;
use crate::render::models::gpu::RouteVertex;
use crate::render::state_output::OutputState;
use crate::render::state_render::RenderState;

pub const ROUTE_WIDTH: f32 = 0.2;
pub const ROUTE_SUBDIVISIONS_PER_SEGMENT: usize = 8;

pub fn build_routes(state: &RenderState, _config: &Config, output: &mut OutputState) {
    output.route_vertices.clear();

    let mut route_start = 0;
    while route_start < state.routes_points.len() {
        let route_id = state.routes_points[route_start].route_id;
        let mut route_end = route_start + 1;
        while route_end < state.routes_points.len()
            && state.routes_points[route_end].route_id == route_id
        {
            route_end += 1;
        }

        if route_end - route_start >= 2 {
            let points: Vec<[f32; 2]> = state.routes_points[route_start..route_end]
                .iter()
                .map(|route_point| {
                    let tile_position = route_point.tile_position;
                    hex_to_world(tile_position.q, tile_position.r)
                })
                .collect();
            build_route_mesh(&points, &mut output.route_vertices);
        }

        route_start = route_end;
    }
}

fn hex_to_world(q: i32, r: i32) -> [f32; 2] {
    let sqrt_3 = 3.0_f32.sqrt();
    [sqrt_3 * q as f32 + (sqrt_3 / 2.0) * r as f32, 1.5 * r as f32]
}

fn build_route_mesh(points: &[[f32; 2]], output: &mut Vec<RouteVertex>) {
    let subdivision_count = ROUTE_SUBDIVISIONS_PER_SEGMENT.max(1);
    let mut smoothed_points = Vec::new();

    for segment in 0..points.len() - 1 {
        let p0 = points[segment.saturating_sub(1)];
        let p1 = points[segment];
        let p2 = points[segment + 1];
        let p3 = points[(segment + 2).min(points.len() - 1)];

        for subdivision in 0..subdivision_count {
            let t = subdivision as f32 / subdivision_count as f32;
            smoothed_points.push(catmull_rom(p0, p1, p2, p3, t));
        }
    }
    smoothed_points.push(*points.last().unwrap());

    let mut distances = vec![0.0; smoothed_points.len()];
    for index in 1..smoothed_points.len() {
        distances[index] = distances[index - 1]
            + distance(smoothed_points[index - 1], smoothed_points[index]);
    }

    let half_width = ROUTE_WIDTH * 0.5;
    for index in 0..smoothed_points.len() - 1 {
        let current = smoothed_points[index];
        let next = smoothed_points[index + 1];
        let tangent = normalize([next[0] - current[0], next[1] - current[1]]);
        let normal = [-tangent[1] * half_width, tangent[0] * half_width];
        let current_left = [current[0] + normal[0], current[1] + normal[1]];
        let current_right = [current[0] - normal[0], current[1] - normal[1]];

        let next_tangent = if index + 2 < smoothed_points.len() {
            let after_next = smoothed_points[index + 2];
            normalize([after_next[0] - next[0], after_next[1] - next[1]])
        } else {
            tangent
        };
        let next_normal = [-next_tangent[1] * half_width, next_tangent[0] * half_width];
        let next_left = [next[0] + next_normal[0], next[1] + next_normal[1]];
        let next_right = [next[0] - next_normal[0], next[1] - next_normal[1]];

        let u_current = distances[index];
        let u_next = distances[index + 1];
        output.extend([
            route_vertex(current_left, u_current, 0.0),
            route_vertex(current_right, u_current, 1.0),
            route_vertex(next_right, u_next, 1.0),
            route_vertex(current_left, u_current, 0.0),
            route_vertex(next_right, u_next, 1.0),
            route_vertex(next_left, u_next, 0.0),
        ]);
    }
}

fn catmull_rom(p0: [f32; 2], p1: [f32; 2], p2: [f32; 2], p3: [f32; 2], t: f32) -> [f32; 2] {
    let t2 = t * t;
    let t3 = t2 * t;
    [
        catmull_rom_component(p0[0], p1[0], p2[0], p3[0], t, t2, t3),
        catmull_rom_component(p0[1], p1[1], p2[1], p3[1], t, t2, t3),
    ]
}

fn catmull_rom_component(
    p0: f32,
    p1: f32,
    p2: f32,
    p3: f32,
    t: f32,
    t2: f32,
    t3: f32,
) -> f32 {
    0.5 * (2.0 * p1
        + (-p0 + p2) * t
        + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2
        + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3)
}

fn normalize(vector: [f32; 2]) -> [f32; 2] {
    let length = (vector[0] * vector[0] + vector[1] * vector[1]).sqrt();
    if length > f32::EPSILON {
        [vector[0] / length, vector[1] / length]
    } else {
        [1.0, 0.0]
    }
}

fn distance(a: [f32; 2], b: [f32; 2]) -> f32 {
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    (dx * dx + dy * dy).sqrt()
}

fn route_vertex(position: [f32; 2], u: f32, v: f32) -> RouteVertex {
    RouteVertex {
        vertex_position: position,
        texture_coords: [u, v],
    }
}
