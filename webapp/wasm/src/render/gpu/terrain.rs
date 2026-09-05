use crate::js::models::{TILE_BIOME_GRASSLAND, TILE_BIOME_OCEAN, TILE_VISIBILITY_UNDISCOVERED};
use crate::render::models::gpu::{TileFogOfWarInstance, TileTerrainLandInstance, TileTerrainWaterInstance};
use crate::render::state_output::OutputState;
use crate::render::state_render::RenderState;

pub fn build_terrain_data(state: &RenderState, output: &mut OutputState) {
    output.terrain_land_instances.clear();
    output.terrain_water_instances.clear();
    output.fog_of_war_instances.clear();

    // for each (visible) tile
    state.visible_chunks.iter().for_each(|chunk_key| {
        let chunk = state.chunks.get(chunk_key).unwrap();
        chunk.tiles.iter().for_each(|tile_index| {
            let tile = state.tiles[*tile_index];

            // create fog-of-war for at least discovered tiles
            if tile.visibility != TILE_VISIBILITY_UNDISCOVERED {
                output.fog_of_war_instances.push(TileFogOfWarInstance {
                    position: [tile.tile_position.q as f32, tile.tile_position.r as f32],
                    visibility: tile.visibility,
                    _padding: [0,0,0]
                });
            }

            // undiscovered -> no terrain visible -> skip
            if(tile.visibility == TILE_VISIBILITY_UNDISCOVERED) {
                return;
            }

            // build water instance
            if tile.terrain.biome == TILE_BIOME_OCEAN {
                output.terrain_water_instances.push(TileTerrainWaterInstance {
                    position: [tile.tile_position.q as f32, tile.tile_position.r as f32],
                });
                return
            }

            // build land instance
            if tile.terrain.biome == TILE_BIOME_GRASSLAND {
                output.terrain_land_instances.push(TileTerrainLandInstance {
                    position: [tile.tile_position.q as f32, tile.tile_position.r as f32],
                });
                return
            }

        })
    });
}