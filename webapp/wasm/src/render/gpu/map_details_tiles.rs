use crate::js::models::{Tile, TileElevation, TileFeature};
use crate::math::random::Random;
use crate::render::config::Config;
use crate::render::gpu::map_details_tools::splatter_details;
use crate::render::models::gpu::MapDetailVertex;

pub fn build_tile_details(
    rng: &mut Random,
    tile: &Tile,
    config: &Config,
    out_vertices: &mut Vec<MapDetailVertex>,
) {
    rng.set_seed(tile.rng_seed as u64);

    match tile.terrain.elevation {
        TileElevation::Hills => {
            splatter_details(
                rng,
                config,
                out_vertices,
                &tile.tile_position,
                &config.map_details.hills,
                false,
            );
        }
        TileElevation::Mountains => {
            splatter_details(
                rng,
                config,
                out_vertices,
                &tile.tile_position,
                &config.map_details.mountains,
                false,
            );
        }
        _ => {}
    };

    match tile.terrain.feature {
        TileFeature::Forest => {
            splatter_details(
                rng,
                config,
                out_vertices,
                &tile.tile_position,
                &config.map_details.trees,
                false,
            );
        }
        _ => {}
    };
}
