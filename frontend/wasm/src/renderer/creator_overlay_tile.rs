use crate::js::models::{MapMode, TilePosition};
use crate::renderer::border_calculator;
use crate::renderer::models::{OverlayTileVertex, RenderState, RendererConfiguration, VertexData};
use crate::utils::rgba_f32_to_u8;

/// Calculate the overlay tiles vertex data from the given render state.
/// Writes the result to the given vertex data.
pub fn update(state: &RenderState, config: &RendererConfiguration, vertex_data: &mut VertexData) {
    // todo: possible optimization: count instances before and init vecs with correct capacity
    vertex_data.overlay.clear();

    let map_mode_data: MapMode = match state.map_mode.as_str() {
        "default" => MapMode::DEFAULT,
        "resources" => MapMode::RESOURCES,
        "terrain" => MapMode::TERRAIN,
        _ => MapMode::DEFAULT,
    };

    for index in &state.relevant_tile_indices {
        let tile = &state.tiles[*index];
        let border = &state.borders[*index];

        if tile.visibility != 2 {
            let position = TilePosition {
                q: tile.position_q,
                r: tile.position_r,
            };
            vertex_data.overlay.push(OverlayTileVertex {
                position: [tile.world_x, tile.world_y],
                tile_position: [tile.position_q, tile.position_r],
                primary_border_mask: border_calculator::pack((map_mode_data.border_provider)(
                    border,
                )),
                primary_border_color: rgba_f32_to_u8(&(map_mode_data.border_color)(tile)),
                primary_fill_color: rgba_f32_to_u8(&(map_mode_data.fill_color)(tile)),
                is_highlighted: if state.move_targets.contains(&position) {
                    1
                } else {
                    0
                },
                _padding: [0, 0],
            });
        }
    }
}
