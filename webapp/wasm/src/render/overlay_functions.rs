use crate::js::models::{HexPosition, Tile};
use crate::render::models::render_state::RenderState;
use crate::render::models::tile_instance_data::{
    GenericEdgeOverlayInstance, GenericFillOverlayInstance,
};

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
    // todo:
    //  add edge, white, striped for each neighbour
    //  if
    //    tile has control of selected entity
    //    AND neighbour has control <0 of selected entity
}

//===== MAP MODE - TERRAIN =========================

pub fn fill_mapmode_terrain(
    state: &RenderState,
    tile: &Tile,
    output: &mut Vec<GenericFillOverlayInstance>,
) {
    // todo:
    //  create fill instance depending on tile biome
    //  -> ocean = color ocean blue, solid
    //  -> grassland = color lush green, solid
    //  if elevation = mountains
    //  -> add additional gray, striped
    //  if feature = forest (and not mountains)
    //  -> add additional dark green, striped
}

pub fn edges_mapmode_terrain(
    state: &RenderState,
    tile: &Tile,
    tiles_by_pos: &rustc_hash::FxHashMap<HexPosition, usize>,
    output: &mut Vec<GenericEdgeOverlayInstance>,
) {
    // todo: same as political
}

//===== MAP MODE - POLITICAL =======================

pub fn fill_mapmode_political(
    state: &RenderState,
    tile: &Tile,
    output: &mut Vec<GenericFillOverlayInstance>,
) {
    // todo:
    //  add fill if total control > 0
    //  color wine red, solid
}

pub fn edges_mapmode_political(
    state: &RenderState,
    tile: &Tile,
    tiles_by_pos: &rustc_hash::FxHashMap<HexPosition, usize>,
    output: &mut Vec<GenericEdgeOverlayInstance>,
) {
    // todo:
    //  add edge for each neighbour if total control goes from >0 to <0
    //  color white, solid
}

//===== MAP MODE - SETTLEMENT LOCATIONS ============

pub fn fill_mapmode_settlement_locations(
    state: &RenderState,
    tile: &Tile,
    output: &mut Vec<GenericFillOverlayInstance>,
) {
    // todo: do nothing
}

pub fn edges_mapmode_settlement_locations(
    state: &RenderState,
    tile: &Tile,
    tiles_by_pos: &rustc_hash::FxHashMap<HexPosition, usize>,
    output: &mut Vec<GenericEdgeOverlayInstance>,
) {
    // todo: do nothing
}
