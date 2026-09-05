use crate::js::models::{HexPosition, SpriteSheetEntry};
use crate::math::random::Random;
use crate::render::config::Config;
use crate::render::models::gpu::MapDetailVertex;
use crate::render::models::sprite_sheet::MapDetailSpriteGroupConfig;

pub fn splatter_details(
    rng: &mut Random,
    config: &Config,
    out_vertices: &mut Vec<MapDetailVertex>,
    position: &HexPosition,
    group_config: &MapDetailSpriteGroupConfig,
    is_pending: bool,
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
            out_vertices,
            position,
            offset,
            entry,
            group_config.atlas_id as u32,
            is_pending,
        );
    }
}

pub fn construct_sprite(
    out_vertices: &mut Vec<MapDetailVertex>,
    position: &HexPosition,
    offset: [f32; 2],
    sprite: &SpriteSheetEntry,
    atlas_id: u32,
    is_pending: bool,
) {
    // texture coordinates use the atlas-native V (v_min = sprite top). The fragment shader
    // inverts V (`1.0 - v`) and textures are uploaded with UNPACK_FLIP_Y_WEBGL, so emitting the
    // native V here makes the sprite render upright.

    let scale = sprite.scale;
    let h_width = (sprite.n_size.width * scale) / 2.0;
    let height = sprite.n_size.height * scale;

    // triangle a
    out_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, 0.0, -h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_min, sprite.uv_coords.v_max],
        is_pending: if is_pending { 1 } else { 0 },
        atlas: atlas_id,
    });
    out_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, 0.0, h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_max, sprite.uv_coords.v_max],
        is_pending: if is_pending { 1 } else { 0 },
        atlas: atlas_id,
    });
    out_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, height, h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_max, sprite.uv_coords.v_min],
        is_pending: if is_pending { 1 } else { 0 },
        atlas: atlas_id,
    });

    // triangle b
    out_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, 0.0, -h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_min, sprite.uv_coords.v_max],
        is_pending: if is_pending { 1 } else { 0 },
        atlas: atlas_id,
    });
    out_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, height, -h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_min, sprite.uv_coords.v_min],
        is_pending: if is_pending { 1 } else { 0 },
        atlas: atlas_id,
    });
    out_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, height, h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_max, sprite.uv_coords.v_min],
        is_pending: if is_pending { 1 } else { 0 },
        atlas: atlas_id,
    });
}
