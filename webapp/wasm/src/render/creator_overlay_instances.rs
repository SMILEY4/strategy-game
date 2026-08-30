use std::collections::HashMap;
use crate::js::models::{
    HexPosition, Tile, TILE_VISIBILITY_UNDISCOVERED,
};
use crate::render::models::render_state::RenderState;
use crate::render::models::tile_instance_data::{GenericEdgeOverlayInstance, GenericFillOverlayInstance, GridOverlayInstance, OverlayVertexData};

pub fn build_tile_grid(state: &RenderState, instance_data: &mut OverlayVertexData) {
    instance_data.grid_instances.clear();
    HexPosition { q: 0, r: 0 }.iterate_circle(3, |pos| {
        instance_data.grid_instances.push(GridOverlayInstance {
            position: [pos.q as f32, pos.r as f32],
        })
    })
}

pub fn build_overlay(
    state: &RenderState,
    instance_data: &mut OverlayVertexData,
    create_fill_func: impl Fn(&RenderState, &Tile) -> Vec<GenericFillOverlayInstance>,
    create_edge_func: impl Fn(&RenderState, &Tile, &HashMap<HexPosition, usize>) -> Vec<GenericEdgeOverlayInstance>,
) {
    instance_data.fill_instances.clear();
    instance_data.edge_instances.clear();

    let mut tiles_by_pos = HashMap::with_capacity(state.tiles.len());
    for (index, tile) in state.tiles.iter().enumerate() {
        tiles_by_pos.insert(tile.tile_position, index);
    }

    state.visible_chunks.iter().for_each(|chunk_key| {
        let chunk = state.chunks.get(chunk_key).unwrap();
        chunk.tiles.iter().for_each(|tile_index| {
            let tile = state.tiles[*tile_index];

            if tile.visibility == TILE_VISIBILITY_UNDISCOVERED {
                return;
            }

            let fills = create_fill_func(&state, &tile);
            instance_data.fill_instances.extend(fills);

            let edges = create_edge_func(&state, &tile, &tiles_by_pos);
            instance_data.edge_instances.extend(edges);

        })
    });
}

