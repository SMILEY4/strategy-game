use crate::js::models::HexPosition;
use crate::render::models::gpu::GridOverlayInstance;
use crate::render::state_output::OutputState;

pub fn build_tile_grid_data(output: &mut OutputState) {
    output.overlay_grid_instances.clear();
    HexPosition { q: 0, r: 0 }.iterate_circle(3, |pos| {
        output.overlay_grid_instances.push(GridOverlayInstance {
            position: [pos.q as f32, pos.r as f32],
        })
    })
}
