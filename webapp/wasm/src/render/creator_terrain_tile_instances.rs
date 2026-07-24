use crate::render::models::render_state::RenderState;
use crate::render::models::tile_instance_data::{TileInstanceData, TileTerrainLandInstance, TileTerrainWaterInstance};

pub fn build(state: &RenderState, instance_data: &mut TileInstanceData) {
    instance_data.terrain_land.clear();
    instance_data.terrain_water.clear();

    state.visible_chunks.iter().for_each(|chunk_key| {
        let chunk = state.chunks.get(chunk_key).unwrap();
        chunk.tiles.iter().for_each(|tile_index| {
            let tile = state.tiles[*tile_index];

            if tile.terrain == 0 {
                instance_data.terrain_water.push(TileTerrainWaterInstance {
                    position: [tile.world_position.x, tile.world_position.y],
                })
            }

            if tile.terrain == 1 {
                instance_data.terrain_land.push(TileTerrainLandInstance {
                    position: [tile.tile_position.q as f32, tile.tile_position.r as f32],
                })
            }

        })
    })
}
