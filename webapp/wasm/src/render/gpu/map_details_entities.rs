use crate::js::models::{Entity, EntityType};
use crate::math::random::Random;
use crate::render::config::Config;
use crate::render::gpu::map_details_tools::{sprite_details, splatter_details};
use crate::render::models::gpu::MapDetailVertex;

pub fn build_entity_details(
    rng: &mut Random,
    entity: &Entity,
    config: &Config,
    out_vertices: &mut Vec<MapDetailVertex>,
) {
    if entity.render_type == EntityType::Settlement {
        splatter_details(
            rng,
            config,
            out_vertices,
            &entity.tile_position,
            &config.map_details.buildings,
            entity.is_pending,
        );
    }
    if entity.render_type == EntityType::TileImprovement {
        let improvement_key = String::from_utf8_lossy(&entity.improvement_key);
        let improvement_key = improvement_key.trim_end_matches('\0');

        sprite_details(
            rng,
            config,
            out_vertices,
            &entity.tile_position,
            &config.map_details.tile_improvement,
            improvement_key,
            entity.is_pending,
        );
    }
}
