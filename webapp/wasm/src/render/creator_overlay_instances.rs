use crate::js::models::{
    HexPosition, Tile, TILE_VISIBILITY_UNDISCOVERED,
};
use crate::render::models::render_state::RenderState;
use crate::render::models::tile_instance_data::{GenericEdgeOverlayInstance, GenericFillOverlayInstance, GridOverlayInstance, OverlayVertexData, OVERLAY_EDGE_STYLE_DASHED};

const SETTLEMENT_CONTROL_COLOR: [f32; 4] = [1.0, 0.85, 0.2, 1.0];

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
    create_fill_func: impl Fn(&RenderState, &Tile, &mut Vec<GenericFillOverlayInstance>),
    create_edge_func: impl Fn(&RenderState, &Tile, &rustc_hash::FxHashMap<HexPosition, usize>, &mut Vec<GenericEdgeOverlayInstance>),
) {
    instance_data.fill_instances.clear();
    instance_data.edge_instances.clear();

    state.visible_chunks.iter().for_each(|chunk_key| {
        let chunk = state.chunks.get(chunk_key).unwrap();
        chunk.tiles.iter().for_each(|tile_index| {
            let tile = state.tiles[*tile_index];

            if tile.visibility == TILE_VISIBILITY_UNDISCOVERED {
                return;
            }

            create_fill_func(state, &tile, &mut instance_data.fill_instances);
            create_edge_func(state, &tile, &state.tiles_by_position, &mut instance_data.edge_instances);

        })
    });
}

pub fn no_overlay_fill(_: &RenderState, _: &Tile, _: &mut Vec<GenericFillOverlayInstance>) {
}

pub fn no_overlay_edges(
    _: &RenderState,
    _: &Tile,
    _: &rustc_hash::FxHashMap<HexPosition, usize>,
    _: &mut Vec<GenericEdgeOverlayInstance>,
) {
}

pub fn entity_control_edges(entity_id: u32) -> impl Fn(&RenderState, &Tile, &rustc_hash::FxHashMap<HexPosition, usize>, &mut Vec<GenericEdgeOverlayInstance>) {
    move |state, tile, tiles_by_pos, output| {
        if control_amount(state, tile, entity_id) <= 0.0 {
            return;
        }

        for (direction, neighbour_position) in neighbour_directions(tile.tile_position) {
            let neighbour_amount = tiles_by_pos
                .get(&neighbour_position)
                .map(|index| control_amount(state, &state.tiles[*index], entity_id))
                .unwrap_or(0.0);

            if neighbour_amount <= 0.0 {
                output.push(GenericEdgeOverlayInstance {
                    position: [tile.tile_position.q as f32, tile.tile_position.r as f32],
                    direction,
                    color: SETTLEMENT_CONTROL_COLOR,
                    style: OVERLAY_EDGE_STYLE_DASHED,
                });
            }
        }
    }
}

fn control_amount(state: &RenderState, tile: &Tile, entity_id: u32) -> f32 {
    let start = tile.control_offset as usize;
    let end = start
        .saturating_add(tile.control_count as usize)
        .min(state.controls.len());

    state.controls[start.min(end)..end]
        .iter()
        .filter(|control| control.entity_id == entity_id)
        .map(|control| control.amount)
        .sum()
}

fn neighbour_directions(position: HexPosition) -> [(u32, HexPosition); 6] {
    [
        (0, HexPosition { q: position.q + 1, r: position.r }),
        (1, HexPosition { q: position.q + 1, r: position.r - 1 }),
        (2, HexPosition { q: position.q, r: position.r - 1 }),
        (3, HexPosition { q: position.q - 1, r: position.r }),
        (4, HexPosition { q: position.q - 1, r: position.r + 1 }),
        (5, HexPosition { q: position.q, r: position.r + 1 }),
    ]
}
