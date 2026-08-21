use crate::js::models::{TILE_BIOME_GRASSLAND, TILE_BIOME_OCEAN, TILE_VISIBILITY_UNDISCOVERED, TILE_VISIBILITY_VISIBLE};
use crate::render::models::render_state::RenderState;
use crate::render::models::tile_instance_data::{TileFogOfWarInstance, TileInstanceData, TileTerrainLandInstance, TileTerrainWaterInstance};

pub fn build(state: &RenderState, instance_data: &mut TileInstanceData) {
    instance_data.terrain_land.clear();
    instance_data.terrain_water.clear();
    instance_data.fog_of_war.clear();

    state.visible_chunks.iter().for_each(|chunk_key| {
        let chunk = state.chunks.get(chunk_key).unwrap();
        chunk.tiles.iter().for_each(|tile_index| {
            let tile = state.tiles[*tile_index];

            if tile.visibility != TILE_VISIBILITY_UNDISCOVERED {
                instance_data.fog_of_war.push(TileFogOfWarInstance {
                    position: [tile.tile_position.q as f32, tile.tile_position.r as f32],
                    visibility: tile.visibility,
                    _padding: [0,0,0]
                });
            }   

            if(tile.visibility == TILE_VISIBILITY_UNDISCOVERED) {
                return;
            }

            if tile.terrain.biome == TILE_BIOME_OCEAN {
                instance_data.terrain_water.push(TileTerrainWaterInstance {
                    position: [tile.tile_position.q as f32, tile.tile_position.r as f32],
                });
                return
            }

            if tile.terrain.biome == TILE_BIOME_GRASSLAND {
                instance_data.terrain_land.push(TileTerrainLandInstance {
                    position: [tile.tile_position.q as f32, tile.tile_position.r as f32],
                });
                return
            }

        })
    });
}
