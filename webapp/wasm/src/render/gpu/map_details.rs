use crate::js::models::{TileBiome, TileVisibility};
use crate::math::random::Random;
use crate::render::config::Config;
use crate::render::gpu::map_details_entities::build_entity_details;
use crate::render::gpu::map_details_tiles::build_tile_details;
use crate::render::state_output::OutputState;
use crate::render::state_render::RenderState;

pub fn build_map_details_data(state: &RenderState, config: &Config, output: &mut OutputState) {
    output.map_detail_vertices.clear();

    let mut rng = Random::new(0);

    // tile details
    state.visible_tiles().for_each(|tile| {
        if tile.visibility == TileVisibility::Undiscovered || tile.terrain.biome == TileBiome::Ocean
        {
            return;
        }
        build_tile_details(&mut rng, &tile, config, &mut output.map_detail_vertices);
    });

    // entity details
    state.visible_entities().for_each(|entity| {
        build_entity_details(&mut rng, &entity, config, &mut output.map_detail_vertices);
    });
}
