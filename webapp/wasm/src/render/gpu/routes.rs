use crate::render::config::Config;
use crate::render::state_output::OutputState;
use crate::render::state_render::RenderState;

pub fn build_routes(state: &RenderState, config: &Config, output: &mut OutputState) {
    output.route_vertices.clear();

    state.routes_points.iter().for_each(|route_point| {
        // todo...
        /*
            - routes_points are points of different "routes"
            - each route has an id, points of that route share the id (hint: all points with same id are packed together in the list)
            - create a line mesh for each individual route
                - in world position
                - with texture coordinates (if i apply a texture later, uvs must not stretch, i.e. the texture does not distort for longer routes)
                - configurable line width
                - subdivide the path, i.e. there are multiple output segments between each input route point (amount configurable)
                - smooth the output path, i.e. smooth "snaking" line between points, line must still pass through input points (-> this is why we need subdivision).
        */
    })

}

