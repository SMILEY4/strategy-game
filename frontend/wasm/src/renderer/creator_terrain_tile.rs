use crate::renderer::border_calculator;
use crate::renderer::models::{
    FogTileVertex, LandTileVertex, RenderState, VertexData, WaterTileVertex,
};
use crate::utils::{mix, rgb_f32_to_u8};

/// Calculate the terrain tiles (land, water, fog) vertex data from the given render state.
/// Writes the result to the given vertex data.
pub fn update(state: &RenderState, vertex_data: &mut VertexData) {
    let color_land_light: [f32; 3] = [148.0 / 255.0, 155.0 / 255.0, 100.0 / 255.0];
    let color_land_dark: [f32; 3] = [116.0 / 255.0, 126.0 / 255.0, 87.0 / 255.0];

    // todo: possible optimization: count instances before and init vecs with correct capacity
    vertex_data.land.clear();
    vertex_data.water.clear();
    vertex_data.fog.clear();

    for index in &state.relevant_tile_indices {
        let tile = &state.tiles[*index];
        let border = &state.borders[*index];

        // land
        if tile.terrain_type == 1 {
            let height_jitter = tile.random_1 * 0.1 - 0.5;
            let height = tile.height * 2.0 + height_jitter;
            let color = mix(&color_land_light, &color_land_dark, height);
            vertex_data.land.push(LandTileVertex {
                position: [tile.world_x, tile.world_y],
                color: rgb_f32_to_u8(&color),
                _padding: 0,
            });
        }

        // water
        if tile.terrain_type == 2 {
            let height_jitter = tile.random_1 * 0.1 - 0.5;
            vertex_data.water.push(WaterTileVertex {
                position: [tile.world_x, tile.world_y],
                depth: 1.0 - ((tile.height + 1.0) * 2.0 + height_jitter).clamp(0.0, 1.0),
                border_mask: border_calculator::pack(&border.coast),
                _padding: [0, 0, 0],
            });
        }

        // fog
        if tile.visibility != 2 {
            vertex_data.fog.push(FogTileVertex {
                position: [tile.world_x, tile.world_y],
                visibility: tile.visibility as i32,
            });
        }
    }
}
