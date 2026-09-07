use crate::js::imported::imported::console_log;
use crate::js::models::{Entity, ENTITY_TYPE_SETTLEMENT, ENTITY_TYPE_TILE_IMPROVEMENT};
use crate::math::random::Random;
use crate::render::config::Config;
use crate::render::gpu::map_details_tools::splatter_details;
use crate::render::models::gpu::MapDetailVertex;
use crate::render::models::sprite_sheet::{SPRITE_GROUP_CONFIG_BUILDINGS, SPRITE_GROUP_CONFIG_TILE_IMPROVEMENT};

pub fn build_entity_details(
    rng: &mut Random,
    entity: &Entity,
    config: &Config,
    out_vertices: &mut Vec<MapDetailVertex>,
) {

    let render_type = entity.render_type;
    console_log(&format!("build entity {}", render_type));

    if entity.render_type == ENTITY_TYPE_SETTLEMENT {
        console_log(&format!(" ...adding settlement"));
        splatter_details(
            rng,
            config,
            out_vertices,
            &entity.tile_position,
            &SPRITE_GROUP_CONFIG_BUILDINGS,
            entity.is_pending,
        );
    }
    if entity.render_type == ENTITY_TYPE_TILE_IMPROVEMENT {
        console_log(&format!(" ...adding tile improvement"));
        splatter_details(
            rng,
            config,
            out_vertices,
            &entity.tile_position,
            &SPRITE_GROUP_CONFIG_TILE_IMPROVEMENT,
            entity.is_pending,
        );
    }
}
