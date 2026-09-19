use crate::js::models::RoutePoint;
use crate::render::config::Config;
use crate::render::state_output::OutputState;
use crate::render::state_render::RenderState;

pub const ROUTE_WIDTH: f32 = 0.2;

pub fn build_routes(state: &RenderState, _config: &Config, output: &mut OutputState) {
    output.route_vertices.clear();

    let routes = get_routes(&state.routes_points);

    for route in routes {
        let raw_path = build_raw_path(&route);
        let smooth_path = build_smooth_path(&raw_path);
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
fn build_raw_path(route: &[RoutePoint]) -> Vec<[f32; 2]> {

    fn hex_to_world(q: i32, r: i32) -> [f32; 2] {
        let sqrt_3 = 3.0_f32.sqrt();
        [sqrt_3 * q as f32 + (sqrt_3 / 2.0) * r as f32, 1.5 * r as f32]
    }

    route
        .iter()
        .map(|point| hex_to_world(point.tile_position.q, point.tile_position.r))
        .collect()
}

/// converts the rough input path into a smoother subdivided output path
fn build_smooth_path(path: &Vec<[f32; 2]>) -> Vec<[f32; 2]> {
    /*
    todo:
    - smooth path, e.g. using Centripetal Catmull–Rom Spline (extract raw algorithm into another file if needed)
    - subdivide path evenly (amount configurable)
    */
}
