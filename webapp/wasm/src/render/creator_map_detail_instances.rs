use crate::math::random::Random;
use crate::render::models::render_state::RenderState;
use crate::render::models::tile_instance_data::MapDetailsVertexData;

pub fn build(state: &RenderState, vertex_data: &mut MapDetailsVertexData) {
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

            rng.set_seed(tile.rng_seed as u64)

            // todo: add tile detail
        });

        // entity details
        chunk.entities.iter().for_each(|entity_index| {
            let entity = state.entities[*entity_index];
            // todo: add entity detail
        });
    });
}
