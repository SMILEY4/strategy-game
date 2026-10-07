use crate::js::models::{Tile, TileElevation, TileFeature};
use crate::math::random::Random;
use crate::render::config::Config;
use crate::render::gpu::map_details_tools::splatter_details;
use crate::render::models::gpu::MapDetailVertex;
use crate::render::models::sprite_sheet::{SPRITE_GROUP_CONFIG_HILLS,
                                          SPRITE_GROUP_CONFIG_MOUNTAINS, SPRITE_GROUP_CONFIG_TREES,
};

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
                &SPRITE_GROUP_CONFIG_HILLS,
                false,
            );
        }
        TileElevation::Mountains => {
            splatter_details(
                rng,
                config,
                out_vertices,
                &tile.tile_position,
                &SPRITE_GROUP_CONFIG_MOUNTAINS,
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
                &SPRITE_GROUP_CONFIG_TREES,
                false,
            );
        }
        _ => {}
    };
}
