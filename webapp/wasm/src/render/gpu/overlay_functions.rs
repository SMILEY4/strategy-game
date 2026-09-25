use crate::js::models::{
    HexPosition, Tile, TILE_BIOME_GRASSLAND, TILE_BIOME_OCEAN, TILE_ELEVATION_MOUNTAINS,
    TILE_FEATURE_FOREST,
};
use crate::render::models::gpu::{
    GenericEdgeOverlayInstance, GenericFillOverlayInstance, OVERLAY_EDGE_STYLE_DASHED,
    OVERLAY_EDGE_STYLE_FILLED, OVERLAY_FILL_STYLE_FILLED, OVERLAY_FILL_STYLE_STRIPED,
};
use crate::render::state_render::RenderState;
use crate::render::state_render::RealmColor;

const NEUTRAL_COLOR: RealmColor = RealmColor {
    red: 0.5,
    green: 0.5,
    blue: 0.5,
};

const POLITICAL_FILL_ALPHA: f32 = 0.35;


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
    let entity_id = state.selected_entity_id;
    let settlement_id = state.selected_settlement_id;

    if entity_id.is_none() && settlement_id.is_none() {
        return;
    }

    let entity_amount = entity_id
        .map(|entity_id| control_amount_by_entity(state, tile, entity_id))
        .unwrap_or(0.0);

    let settlement_amount = settlement_id
        .map(|settlement_id| control_amount_by_settlement(state, tile, settlement_id))
        .unwrap_or(0.0);

    if entity_amount <= 0.0 && settlement_amount <= 0.0 {
        return;
    }

    for (direction, neighbour_position) in neighbour_directions(tile.tile_position) {
        let neighbour_tile = tiles_by_pos
            .get(&neighbour_position)
            .map(|index| &state.tiles[*index]);

        let neighbour_entity_amount = entity_id
            .zip(neighbour_tile)
            .map(|(entity_id, neighbour_tile)| {
                control_amount_by_entity(state, neighbour_tile, entity_id)
            })
            .unwrap_or(0.0);

        let neighbour_settlement_amount = settlement_id
            .zip(neighbour_tile)
            .map(|(settlement_id, neighbour_tile)| {
                control_amount_by_settlement(state, neighbour_tile, settlement_id)
            })
            .unwrap_or(0.0);

        let entity_boundary = entity_amount > 0.0 && neighbour_entity_amount <= 0.0;
        let settlement_boundary = settlement_amount > 0.0 && neighbour_settlement_amount <= 0.0;

        if entity_boundary && settlement_id != entity_id {
            output.push(GenericEdgeOverlayInstance {
                position: position(tile),
                direction,
                color: [1.0, 1.0, 1.0, 1.0],
                style: OVERLAY_EDGE_STYLE_DASHED,
                thickness: 0.05
            });
        }

        if settlement_boundary {
            output.push(GenericEdgeOverlayInstance {
                position: position(tile),
                direction,
                color: [1.0, 1.0, 1.0, 1.0],
                style: OVERLAY_EDGE_STYLE_DASHED,
                thickness: 0.1
            });
        }
    }
}

//===== MAP MODE - POLITICAL =======================

pub fn fill_mapmode_political(
    state: &RenderState,
    tile: &Tile,
    output: &mut Vec<GenericFillOverlayInstance>,
) {
    if let Some(realm_id) = owner_realm(tile) {
        output.push(fill_instance(
            tile,
            realm_color(state, realm_id).with_alpha(POLITICAL_FILL_ALPHA),
            if tile.conversion_active && tile.converting_realm == 0 {
                OVERLAY_FILL_STYLE_STRIPED
            } else {
                OVERLAY_FILL_STYLE_FILLED
            },
        ));
    }

    if let Some(realm_id) = converting_realm(tile) {
        output.push(fill_instance(
            tile,
            realm_color(state, realm_id).with_alpha(POLITICAL_FILL_ALPHA),
            OVERLAY_FILL_STYLE_STRIPED,
        ));
    }
}

pub fn edges_mapmode_political(
    state: &RenderState,
    tile: &Tile,
    tiles_by_pos: &rustc_hash::FxHashMap<HexPosition, usize>,
    output: &mut Vec<GenericEdgeOverlayInstance>,
) {
    let Some(realm_id) = owner_realm(tile) else {
        return;
    };
    let color = state
        .realm_colors
        .get(&realm_id)
        .copied()
        .unwrap_or(NEUTRAL_COLOR);

    for (direction, neighbour_position) in neighbour_directions(tile.tile_position) {
        let neighbour_realm = tiles_by_pos
            .get(&neighbour_position)
            .and_then(|index| owner_realm(&state.tiles[*index]));

        if neighbour_realm != Some(realm_id) {
            output.push(GenericEdgeOverlayInstance {
                position: position(tile),
                direction,
                color: color.with_alpha(1.0),
                style: OVERLAY_EDGE_STYLE_FILLED,
                thickness: 0.1
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
        output.push(fill_instance(
            tile,
            [0.2, 0.6, 0.25, 0.35],
            OVERLAY_FILL_STYLE_STRIPED,
        ));
    } else if tile.create_settlement_validity == 2 {
        output.push(fill_instance(
            tile,
            [0.2, 0.6, 0.25, 0.35],
            OVERLAY_FILL_STYLE_FILLED,
        ));
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

fn owner_realm(tile: &Tile) -> Option<u32> {
    (tile.owner_realm != 0).then_some(tile.owner_realm)
}

fn converting_realm(tile: &Tile) -> Option<u32> {
    (tile.conversion_active && tile.converting_realm != 0).then_some(tile.converting_realm)
}

fn realm_color(state: &RenderState, realm_id: u32) -> RealmColor {
    state
        .realm_colors
        .get(&realm_id)
        .copied()
        .unwrap_or(NEUTRAL_COLOR)
}

fn control_amount_by_entity(state: &RenderState, tile: &Tile, entity_id: u32) -> f32 {
    controls(state, tile)
        .iter()
        .filter(|control| control.entity_id == entity_id)
        .map(|control| control.amount)
        .sum()
}

fn control_amount_by_settlement(state: &RenderState, tile: &Tile, settlement_id: u32) -> f32 {
    controls(state, tile)
        .iter()
        .filter(|control| control.settlement_id == settlement_id)
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
        (
            0,
            HexPosition {
                q: position.q + 1,
                r: position.r,
            },
        ),
        (
            1,
            HexPosition {
                q: position.q + 1,
                r: position.r - 1,
            },
        ),
        (
            2,
            HexPosition {
                q: position.q,
                r: position.r - 1,
            },
        ),
        (
            3,
            HexPosition {
                q: position.q - 1,
                r: position.r,
            },
        ),
        (
            4,
            HexPosition {
                q: position.q - 1,
                r: position.r + 1,
            },
        ),
        (
            5,
            HexPosition {
                q: position.q,
                r: position.r + 1,
            },
        ),
    ]
}
