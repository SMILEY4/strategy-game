use crate::js::models::{Entity, ENTITY_TYPE_SETTLEMENT};
use crate::math::random::Random;
use crate::render::config::Config;
use crate::render::gpu::map_details_tools::splatter_details;
use crate::render::models::gpu::MapDetailVertex;
use crate::render::models::sprite_sheet::SPRITE_GROUP_CONFIG_BUILDINGS;

pub fn build_entity_details(
    rng: &mut Random,
    entity: &Entity,
    config: &Config,
    out_vertices: &mut Vec<MapDetailVertex>,
) {
    if entity.render_type == ENTITY_TYPE_SETTLEMENT {
        splatter_details(
            rng,
            config,
            out_vertices,
            &entity.tile_position,
            &SPRITE_GROUP_CONFIG_BUILDINGS,
            entity.is_pending,
        );
    }
}
