use crate::js::models::HexPosition;
use crate::render::models::render_state::RenderState;
use crate::render::models::tile_instance_data::{GridOverlayInstance, OverlayVertexData};

// render grid centered on cursor
//      grid instances centered on 0,0 with radius r
//      render with uniform == cursor position
//      vert-shader moves grid to tile with cursor
//      frag-shader calculates distance -> fades edges of grid
pub fn build_tile_grid(state: &RenderState, instance_data: &mut OverlayVertexData) {
    instance_data.grid_instances.clear();
    HexPosition { q: 0, r: 0 }.iterate_circle(3, |pos| {
        instance_data.grid_instances.push(GridOverlayInstance {
            position: [pos.q as f32, pos.r as f32],
        })
    })
}
