use crate::js::models::{TILE_BIOME_OCEAN,
                        TILE_VISIBILITY_UNDISCOVERED,
};
use crate::math::random::Random;
use crate::render::config::Config;
use crate::render::gpu::map_details_entities::build_entity_details;
use crate::render::gpu::map_details_tiles::build_tile_details;
use crate::render::state_output::OutputState;
use crate::render::state_render::RenderState;

pub fn build_map_details_data(state: &RenderState, config: &Config, output: &mut OutputState) {
    output.map_detail_vertices.clear();

    let mut rng = Random::new(0);

    state.visible_chunks.iter().for_each(|chunk_key| {
        let chunk = state.chunks.get(chunk_key).unwrap();

        // tile details
        chunk.tiles.iter().for_each(|tile_index| {
            let tile = state.tiles[*tile_index];
            if tile.visibility == TILE_VISIBILITY_UNDISCOVERED
                || tile.terrain.biome == TILE_BIOME_OCEAN
            {
                return;
            }
            build_tile_details(&mut rng, &tile, config, &mut output.map_detail_vertices);
        });

        // entity details
        chunk.entities.iter().for_each(|entity_index| {
            let entity = state.entities[*entity_index];
            build_entity_details(&mut rng, &entity, config, &mut output.map_detail_vertices);
        });
    });
}
