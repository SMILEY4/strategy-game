use crate::js::models::{HexPosition, SpriteSheetEntry};
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
            if (tile.visibility == 0) {
                return;
            }
            if(tile.terrain == 0) {
                return;
            }
            rng.set_seed(tile.rng_seed as u64);
            for _ in 0..rng.usize_range(2, 5) {
                let entry = rng.pick(config.spritesheet_entries.get(&1).unwrap()).unwrap();
                let offset = [rng.f32_signed(), rng.f32_signed()];
                construct_sprite(vertex_data, tile.tile_position, offset, entry);
            }
        });

        // entity details
        chunk.entities.iter().for_each(|entity_index| {
            let entity = state.entities[*entity_index];
            // todo: add entity detail
        });
    });
}

fn construct_sprite(
    vertex_data: &mut MapDetailsVertexData,
    position: HexPosition,
    offset: [f32; 2],
    sprite: &SpriteSheetEntry
) {

    // todo: note: texture y inverted here for testing: correct would be to switch v_min <> v_max

    // triangle a
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, 0.0, 0.0],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_min, sprite.uv_coords.v_max],
        color: [0.0, 0.0, 0.0],
    });
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, 0.0, 1.0],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_max, sprite.uv_coords.v_max],
        color: [0.0, 0.0, 0.0],
    });
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, 1.0, 1.0],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_max, sprite.uv_coords.v_min],
        color: [0.0, 0.0, 0.0],
    });

    // triangle b
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, 0.0, 0.0],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_min, sprite.uv_coords.v_max],
        color: [0.0, 0.0, 0.0],
    });
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, 1.0, 0.0],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_min, sprite.uv_coords.v_min],
        color: [0.0, 0.0, 0.0],
    });
    vertex_data.map_detail_vertices.push(MapDetailVertex {
        position: [position.q as f32, position.r as f32],
        vertex: [0.0, 1.0, 1.0],
        offset: offset,
        texture_coords: [sprite.uv_coords.u_max, sprite.uv_coords.v_min],
        color: [0.0, 0.0, 0.0],
    });

}
