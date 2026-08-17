use crate::js::models::{
    Entity, HexPosition, SpriteSheetEntry, Tile, ENTITY_TYPE_SETTLEMENT, TILE_BIOME_OCEAN,
    TILE_ELEVATION_HILLS, TILE_ELEVATION_MOUNTAINS, TILE_FEATURE_FOREST,
    TILE_VISIBILITY_UNDISCOVERED,
};
use crate::math::random::Random;
use crate::render::models::config::{
    MapDetailSpriteGroupConfig, RenderConfig, SPRITE_GROUP_CONFIG_BUILDINGS,
    SPRITE_GROUP_CONFIG_HILLS, SPRITE_GROUP_CONFIG_MOUNTAINS, SPRITE_GROUP_CONFIG_TREES,
};
use crate::render::models::render_state::RenderState;
use crate::render::models::tile_instance_data::{MapDetailVertex, MapDetailsVertexData};

pub fn build(config: &RenderConfig, state: &RenderState, vertex_data: &mut MapDetailsVertexData) {
    vertex_data.map_detail_vertices.clear();

    let mut rng = Random::new(0);

    state.visible_chunks.iter().for_each(|chunk_key| {
        let chunk = state.chunks.get(chunk_key).unwrap();

        // tile details
        chunk.tiles.iter().for_each(|tile_index| {
            let tile = state.tiles[*tile_index];
            if (tile.visibility == TILE_VISIBILITY_UNDISCOVERED
                || tile.terrain.biome == TILE_BIOME_OCEAN)
            {
                return;
            }
            build_tile_details(&mut rng, &tile, config, vertex_data);
        });

        // entity details
        chunk.entities.iter().for_each(|entity_index| {
            let entity = state.entities[*entity_index];
            build_entity_details(&mut rng, &entity, config, vertex_data);
        });
    });
}

fn build_entity_details(
    rng: &mut Random,
    entity: &Entity,
    config: &RenderConfig,
    vertex_data: &mut MapDetailsVertexData,
) {
    if entity.render_type == ENTITY_TYPE_SETTLEMENT {
        splatter_details(
            rng,
            config,
            vertex_data,
            &entity.tile_position,
            &SPRITE_GROUP_CONFIG_BUILDINGS,
        );
    }
}

fn build_tile_details(
    rng: &mut Random,
    tile: &Tile,
    config: &RenderConfig,
    vertex_data: &mut MapDetailsVertexData,
) {
    rng.set_seed(tile.rng_seed as u64);

    match tile.terrain.elevation {
        TILE_ELEVATION_HILLS => {
            splatter_details(
                rng,
                config,
                vertex_data,
                &tile.tile_position,
                &SPRITE_GROUP_CONFIG_HILLS,
            );
        }
        TILE_ELEVATION_MOUNTAINS => {
            splatter_details(
                rng,
                config,
                vertex_data,
                &tile.tile_position,
                &SPRITE_GROUP_CONFIG_MOUNTAINS,
            );
        }
        _ => {}
    };

    match tile.terrain.feature {
        TILE_FEATURE_FOREST => {
            splatter_details(
                rng,
                config,
                vertex_data,
                &tile.tile_position,
                &SPRITE_GROUP_CONFIG_TREES,
            );
        }
        _ => {}
    };
}

fn splatter_details(
    rng: &mut Random,
    config: &RenderConfig,
    vertex_data: &mut MapDetailsVertexData,
    position: &HexPosition,
    group_config: &MapDetailSpriteGroupConfig,
) {
    let atlas = config
        .spritesheet_entries
        .get(&group_config.atlas_id)
        .unwrap();
    for _ in 0..rng.usize_range(group_config.amount[0], group_config.amount[1]) {
        let entry = rng.pick(atlas).unwrap();

        let mut offset = rng.point_in_circle_f32(group_config.radius, group_config.distribution);
        offset[0] = offset[0] * group_config.squish;
        offset[0] = offset[0] - group_config.push;

        construct_sprite(
            vertex_data,
            position,
            offset,
            entry,
            group_config.atlas_id as u32,
        );
    }
}

fn construct_sprite(
    vertex_data: &mut MapDetailsVertexData,
    position: &HexPosition,
    offset: [f32; 2],
    sprite: &SpriteSheetEntry,
    atlas_id: u32,
) {
    // texture coordinates use the atlas-native V (v_min = sprite top). The fragment shader
    // inverts V (`1.0 - v`) and textures are uploaded with UNPACK_FLIP_Y_WEBGL, so emitting the
    // native V here makes the sprite render upright.

    let scale = sprite.scale;
    let h_width = (sprite.n_size.width * scale) / 2.0;
    let height = sprite.n_size.height * scale;

    // triangle a
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, 0.0, -h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_min, sprite.uv_coords.v_max],
        color: [0.0, 0.0, 0.0],
        atlas: atlas_id,
    });
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, 0.0, h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_max, sprite.uv_coords.v_max],
        color: [0.0, 0.0, 0.0],
        atlas: atlas_id,
    });
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, height, h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_max, sprite.uv_coords.v_min],
        color: [0.0, 0.0, 0.0],
        atlas: atlas_id,
    });

    // triangle b
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, 0.0, -h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_min, sprite.uv_coords.v_max],
        color: [0.0, 0.0, 0.0],
        atlas: atlas_id,
    });
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, height, -h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_min, sprite.uv_coords.v_min],
        color: [0.0, 0.0, 0.0],
        atlas: atlas_id,
    });
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, height, h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_max, sprite.uv_coords.v_min],
        color: [0.0, 0.0, 0.0],
        atlas: atlas_id,
    });
}
