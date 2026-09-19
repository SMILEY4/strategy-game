use crate::js::models::{HexPosition, RoutePoint};
use crate::render::config::Config;
use crate::render::models::gpu::RouteVertex;
use crate::render::state_output::OutputState;
use crate::render::state_render::RenderState;
use crate::render::gpu::route_preprocessing::split_unique_routes;

pub const ROUTE_WIDTH: f32 = 0.2;
pub const ROUTE_SUBDIVISIONS_PER_SEGMENT: usize = 8;

pub fn build_routes(state: &RenderState, _config: &Config, output: &mut OutputState) {
    output.route_vertices.clear();

    let grouped_routes = get_routes(&state.routes_points);
    let routes = split_unique_routes(&grouped_routes);

    for route in routes {
        let raw_path = build_raw_path(&route);
        let smooth_path = build_smooth_path(&raw_path, ROUTE_SUBDIVISIONS_PER_SEGMENT);
        build_line_mesh(
            &smooth_path,
            ROUTE_WIDTH,
            raw_path.len() as f32,
            &mut output.route_vertices,
        );
    }
}

/// Splits the continuous list of route points into individual routes.
fn get_routes(route_points: &[RoutePoint]) -> Vec<&[RoutePoint]> {
    let mut routes = Vec::new();
    if route_points.is_empty() {
        return routes;
    }
    let mut route_start = 0;
    for (index, route_point) in route_points.iter().enumerate().skip(1) {
        if route_point.route_id != route_points[route_start].route_id {
            if index - route_start >= 2 {
                routes.push(&route_points[route_start..index]);
            }
            route_start = index;
        }
    }
    if route_points.len() - route_start >= 2 {
        routes.push(&route_points[route_start..]);
    }
    routes
}

/// converts the route into a list of world positions
fn build_raw_path(route: &[HexPosition]) -> Vec<[f32; 2]> {

    fn hex_to_world(q: i32, r: i32) -> [f32; 2] {
        let sqrt_3 = 3.0_f32.sqrt();
        [sqrt_3 * q as f32 + (sqrt_3 / 2.0) * r as f32, 1.5 * r as f32]
    }

    route
        .iter()
        .map(|point| hex_to_world(point.q, point.r))
        .collect()
}

/// converts the rough input path into a smoother subdivided output path
fn build_smooth_path(path: &[[f32; 2]], subdivisions_per_segment: usize) -> Vec<[f32; 2]> {
    if path.len() < 2 {
        return path.to_vec();
    }

    let subdivisions_per_segment = subdivisions_per_segment.max(1);
    let segment_count = path.len() - 1;
    let mut smooth_path = Vec::with_capacity(segment_count * subdivisions_per_segment + 1);

    for segment in 0..segment_count {
        let p0 = if segment == 0 { path[0] } else { path[segment - 1] };
        let p1 = path[segment];
        let p2 = path[segment + 1];
        let p3 = if segment + 2 < path.len() {
            path[segment + 2]
        } else {
            path[path.len() - 1]
        };

        let t0 = 0.0;
        let t1 = t0 + distance(p0, p1).sqrt();
        let t2 = t1 + distance(p1, p2).sqrt();
        let t3 = t2 + distance(p2, p3).sqrt();

        for subdivision in 0..subdivisions_per_segment {
            let t = t1 + (t2 - t1) * subdivision as f32 / subdivisions_per_segment as f32;
            smooth_path.push(interpolate_centripetal(p0, p1, p2, p3, t0, t1, t2, t3, t));
        }
    }

    smooth_path.push(*path.last().unwrap());
    smooth_path
}

fn distance(a: [f32; 2], b: [f32; 2]) -> f32 {
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    (dx * dx + dy * dy).sqrt()
}

fn interpolate_centripetal(
    p0: [f32; 2],
    p1: [f32; 2],
    p2: [f32; 2],
    p3: [f32; 2],
    t0: f32,
    t1: f32,
    t2: f32,
    t3: f32,
    t: f32,
) -> [f32; 2] {
    fn interpolate(a: [f32; 2], b: [f32; 2], ta: f32, tb: f32, t: f32) -> [f32; 2] {
        if (tb - ta).abs() < f32::EPSILON {
            return a;
        }

        let factor = (t - ta) / (tb - ta);
        [
            a[0] + (b[0] - a[0]) * factor,
            a[1] + (b[1] - a[1]) * factor,
        ]
    }

    let a1 = interpolate(p0, p1, t0, t1, t);
    let a2 = interpolate(p1, p2, t1, t2, t);
    let a3 = interpolate(p2, p3, t2, t3, t);
    let b1 = interpolate(a1, a2, t0, t2, t);
    let b2 = interpolate(a2, a3, t1, t3, t);
    interpolate(b1, b2, t1, t2, t)
}

/// Converts the given path to a triangle-list mesh and appends it to `output`.
fn build_line_mesh(
    path: &[[f32; 2]],
    width: f32,
    path_length: f32,
    output: &mut Vec<RouteVertex>,
) {
    if path.len() < 2 || width <= 0.0 {
        return;
    }

    let mut segment_lengths = Vec::with_capacity(path.len() - 1);
    let mut total_length = 0.0;
    for segment in path.windows(2) {
        let length = distance(segment[0], segment[1]);
        segment_lengths.push(length);
        total_length += length;
    }

    if total_length <= f32::EPSILON {
        return;
    }

    let half_width = width / 2.0;
    let directions: Vec<[f32; 2]> = path
        .windows(2)
        .zip(&segment_lengths)
        .map(|(segment, &length)| {
            if length <= f32::EPSILON {
                [0.0, 0.0]
            } else {
                [
                    (segment[1][0] - segment[0][0]) / length,
                    (segment[1][1] - segment[0][1]) / length,
                ]
            }
        })
        .collect();

    let normals: Vec<[f32; 2]> = directions
        .iter()
        .map(|direction| [-direction[1], direction[0]])
        .collect();

    let offsets: Vec<[f32; 2]> = (0..path.len())
        .map(|point_index| {
            let normal = if point_index == 0 {
                normals[0]
            } else if point_index == path.len() - 1 {
                normals[normals.len() - 1]
            } else {
                let previous = normals[point_index - 1];
                let next = normals[point_index];
                let miter = normalize([previous[0] + next[0], previous[1] + next[1]]);
                let miter_scale = dot(miter, next);

                if miter_scale.abs() <= f32::EPSILON {
                    next
                } else {
                    [miter[0] / miter_scale, miter[1] / miter_scale]
                }
            };

            [normal[0] * half_width, normal[1] * half_width]
        })
        .collect();

    let mut distance_along_path = 0.0;
    for (segment_index, (segment, length)) in path
        .windows(2)
        .zip(segment_lengths)
        .enumerate()
    {
        if length <= f32::EPSILON {
            continue;
        }

        let left_start = [
            segment[0][0] + offsets[segment_index][0],
            segment[0][1] + offsets[segment_index][1],
        ];
        let right_start = [
            segment[0][0] - offsets[segment_index][0],
            segment[0][1] - offsets[segment_index][1],
        ];
        let left_end = [
            segment[1][0] + offsets[segment_index + 1][0],
            segment[1][1] + offsets[segment_index + 1][1],
        ];
        let right_end = [
            segment[1][0] - offsets[segment_index + 1][0],
            segment[1][1] - offsets[segment_index + 1][1],
        ];
        let start_u = distance_along_path / total_length;
        let end_u = (distance_along_path + length) / total_length;

        output.extend([
            RouteVertex { vertex_position: left_start, texture_coords: [start_u, 0.0], path_length },
            RouteVertex { vertex_position: right_start, texture_coords: [start_u, 1.0], path_length },
            RouteVertex { vertex_position: right_end, texture_coords: [end_u, 1.0], path_length },
            RouteVertex { vertex_position: left_start, texture_coords: [start_u, 0.0], path_length },
            RouteVertex { vertex_position: right_end, texture_coords: [end_u, 1.0], path_length },
            RouteVertex { vertex_position: left_end, texture_coords: [end_u, 0.0], path_length },
        ]);

        distance_along_path += length;
    }
}

fn dot(a: [f32; 2], b: [f32; 2]) -> f32 {
    a[0] * b[0] + a[1] * b[1]
}

fn normalize(vector: [f32; 2]) -> [f32; 2] {
    let length = (vector[0] * vector[0] + vector[1] * vector[1]).sqrt();
    if length <= f32::EPSILON {
        [0.0, 0.0]
    } else {
        [vector[0] / length, vector[1] / length]
    }
}
