use crate::js::models::{HexPosition, SpriteSheetEntry, Tile, SPRITE_ATLAS_HILLS, SPRITE_ATLAS_MOUNTAINS, TILE_BIOME_OCEAN, TILE_ELEVATION_FLAT, TILE_ELEVATION_HILLS, TILE_ELEVATION_MOUNTAINS, TILE_VISIBILITY_UNDISCOVERED};
use crate::math::random::Random;
use crate::render::models::config::RenderConfig;
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
            if (tile.visibility == TILE_VISIBILITY_UNDISCOVERED || tile.terrain.biome == TILE_BIOME_OCEAN) {
                return;
            }
            build_tile_details(&mut rng, &tile, config, vertex_data);
        });

        // entity details
        chunk.entities.iter().for_each(|entity_index| {
            let entity = state.entities[*entity_index];
            // todo: add entity detail
        });
    });
}


fn build_tile_details(rng: &mut Random, tile: &Tile, config: &RenderConfig, vertex_data: &mut MapDetailsVertexData) {

    rng.set_seed(tile.rng_seed as u64);

    match tile.terrain.elevation {
        TILE_ELEVATION_FLAT => {}
        TILE_ELEVATION_HILLS => {
            splatter_details(rng, config, vertex_data, SPRITE_ATLAS_HILLS, [2, 3], &tile.tile_position)
        }
        TILE_ELEVATION_MOUNTAINS => {
            splatter_details(rng, config, vertex_data, SPRITE_ATLAS_MOUNTAINS, [2, 3], &tile.tile_position)
        }
        _ => {}
    };

}

fn splatter_details(rng: &mut Random, config: &RenderConfig, vertex_data: &mut MapDetailsVertexData, atlas_id: i32, amount: [usize; 2], position: &HexPosition) {
    let atlas = config.spritesheet_entries.get(&atlas_id).unwrap();
    for _ in 0..rng.usize_range(amount[0], amount[1]) {
        let entry = rng.pick(atlas).unwrap();
        let offset = [rng.f32_signed(), rng.f32_signed()];
        construct_sprite(vertex_data, position, offset, entry, atlas_id as u32);
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

    let h_width = (sprite.n_size.width * sprite.scale) / 2.0;
    let height = sprite.n_size.height * sprite.scale;

    // triangle a
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, 0.0, -h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_min, sprite.uv_coords.v_max],
        color: [0.0, 0.0, 0.0],
        atlas: atlas_id
    });
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, 0.0, h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_max, sprite.uv_coords.v_max],
        color: [0.0, 0.0, 0.0],
        atlas: atlas_id
    });
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, height, h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_max, sprite.uv_coords.v_min],
        color: [0.0, 0.0, 0.0],
        atlas: atlas_id
    });

    // triangle b
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, 0.0, -h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_min, sprite.uv_coords.v_max],
        color: [0.0, 0.0, 0.0],
        atlas: atlas_id
    });
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, height, -h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_min, sprite.uv_coords.v_min],
        color: [0.0, 0.0, 0.0],
        atlas: atlas_id
    });
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, height, h_width],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_max, sprite.uv_coords.v_min],
        color: [0.0, 0.0, 0.0],
        atlas: atlas_id
    });

}
