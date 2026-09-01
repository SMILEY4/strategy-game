use crate::js::models::{
    HexPosition, Tile, TILE_BIOME_GRASSLAND, TILE_BIOME_OCEAN, TILE_ELEVATION_MOUNTAINS,
    TILE_FEATURE_FOREST,
};
use crate::render::models::render_state::RenderState;
use crate::render::models::tile_instance_data::{
    GenericEdgeOverlayInstance, GenericFillOverlayInstance, OVERLAY_EDGE_STYLE_FILLED,
    OVERLAY_EDGE_STYLE_DASHED, OVERLAY_FILL_STYLE_FILLED, OVERLAY_FILL_STYLE_STRIPED,
};

const OCEAN_COLOR: [f32; 4] = [0.08, 0.35, 0.65, 0.35];
const GRASSLAND_COLOR: [f32; 4] = [0.2, 0.6, 0.25, 0.35];
const MOUNTAINS_COLOR: [f32; 4] = [0.45, 0.45, 0.45, 0.55];
const FOREST_COLOR: [f32; 4] = [0.05, 0.3, 0.1, 0.55];
const POLITICAL_COLOR: [f32; 4] = [0.55, 0.08, 0.18, 0.35];
const BORDER_COLOR: [f32; 4] = [1.0, 1.0, 1.0, 1.0];

//===== NO-OP ======================================

pub fn fill_none(_: &RenderState, _: &Tile, _: &mut Vec<GenericFillOverlayInstance>) {}

pub fn edges_none(
    _: &RenderState,
    _: &Tile,
    _: &rustc_hash::FxHashMap<HexPosition, usize>,
    _: &mut Vec<GenericEdgeOverlayInstance>,
) {
}

//===== ENTITY CONTROL AREA ========================

pub fn edges_entity_control(
    state: &RenderState,
    tile: &Tile,
    tiles_by_pos: &rustc_hash::FxHashMap<HexPosition, usize>,
    output: &mut Vec<GenericEdgeOverlayInstance>,
) {
    let Some(entity_id) = state.selected_entity_id else {
        return;
    };

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
                position: position(tile),
                direction,
                color: BORDER_COLOR,
                style: OVERLAY_EDGE_STYLE_DASHED,
            });
        }
    }
}

//===== MAP MODE - TERRAIN =========================

pub fn fill_mapmode_terrain(
    _: &RenderState,
    tile: &Tile,
    output: &mut Vec<GenericFillOverlayInstance>,
) {
    let color = match tile.terrain.biome {
        TILE_BIOME_OCEAN => OCEAN_COLOR,
        TILE_BIOME_GRASSLAND => GRASSLAND_COLOR,
        _ => return,
    };

    output.push(fill_instance(tile, color, OVERLAY_FILL_STYLE_FILLED));

    if tile.terrain.elevation == TILE_ELEVATION_MOUNTAINS {
        output.push(fill_instance(tile, MOUNTAINS_COLOR, OVERLAY_FILL_STYLE_STRIPED));
    } else if tile.terrain.feature == TILE_FEATURE_FOREST {
        output.push(fill_instance(tile, FOREST_COLOR, OVERLAY_FILL_STYLE_STRIPED));
    }
}

pub fn edges_mapmode_terrain(
    state: &RenderState,
    tile: &Tile,
    tiles_by_pos: &rustc_hash::FxHashMap<HexPosition, usize>,
    output: &mut Vec<GenericEdgeOverlayInstance>,
) {
    edges_mapmode_political(state, tile, tiles_by_pos, output);
}

//===== MAP MODE - POLITICAL =======================

pub fn fill_mapmode_political(
    state: &RenderState,
    tile: &Tile,
    output: &mut Vec<GenericFillOverlayInstance>,
) {
    if total_control(state, tile) > 0.0 {
        output.push(fill_instance(tile, POLITICAL_COLOR, OVERLAY_FILL_STYLE_FILLED));
    }
}

pub fn edges_mapmode_political(
    state: &RenderState,
    tile: &Tile,
    tiles_by_pos: &rustc_hash::FxHashMap<HexPosition, usize>,
    output: &mut Vec<GenericEdgeOverlayInstance>,
) {
    if total_control(state, tile) <= 0.0 {
        return;
    }

    for (direction, neighbour_position) in neighbour_directions(tile.tile_position) {
        let neighbour_control = tiles_by_pos
            .get(&neighbour_position)
            .map(|index| total_control(state, &state.tiles[*index]))
            .unwrap_or(0.0);

        if neighbour_control <= 0.0 {
            output.push(GenericEdgeOverlayInstance {
                position: position(tile),
                direction,
                color: BORDER_COLOR,
                style: OVERLAY_EDGE_STYLE_FILLED,
            });
        }
    }
}

//===== MAP MODE - SETTLEMENT LOCATIONS ============

pub fn fill_mapmode_settlement_locations(
    _: &RenderState,
    tile: &Tile,
    output: &mut Vec<GenericFillOverlayInstance>,
) {
    if tile.create_settlement_validity == 1 {
        output.push(fill_instance(tile, [0.2, 0.6, 0.25, 0.35], OVERLAY_FILL_STYLE_STRIPED));
    } else if tile.create_settlement_validity == 2 {
        output.push(fill_instance(tile, [0.2, 0.6, 0.25, 0.35], OVERLAY_FILL_STYLE_FILLED));
    }
}

pub fn edges_mapmode_settlement_locations(
    _: &RenderState,
    _: &Tile,
    _: &rustc_hash::FxHashMap<HexPosition, usize>,
    _: &mut Vec<GenericEdgeOverlayInstance>,
) {
}

//===== UTILITIES ==================================

fn position(tile: &Tile) -> [f32; 2] {
    [tile.tile_position.q as f32, tile.tile_position.r as f32]
}

fn fill_instance(tile: &Tile, color: [f32; 4], style: u32) -> GenericFillOverlayInstance {
    GenericFillOverlayInstance {
        position: position(tile),
        color,
        style,
    }
}

fn total_control(state: &RenderState, tile: &Tile) -> f32 {
    controls(state, tile).iter().map(|control| control.amount).sum()
}

fn control_amount(state: &RenderState, tile: &Tile, entity_id: u32) -> f32 {
    controls(state, tile)
        .iter()
        .filter(|control| control.entity_id == entity_id)
        .map(|control| control.amount)
        .sum()
}

fn controls<'a>(state: &'a RenderState, tile: &Tile) -> &'a [crate::js::models::Control] {
    let start = (tile.control_offset as usize).min(state.controls.len());
    let end = start
        .saturating_add(tile.control_count as usize)
        .min(state.controls.len());
    &state.controls[start..end]
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
