use rustc_hash::FxHashMap;
use crate::js::models::{HexPosition, Tile, MAP_MODE_POLITICAL, MAP_MODE_SETTLEMENT_LOCATIONS, MAP_MODE_TERRAIN, TILE_VISIBILITY_UNDISCOVERED};
use crate::render::gpu::overlay_functions;
use crate::render::models::gpu::{GenericEdgeOverlayInstance, GenericFillOverlayInstance};
use crate::render::state_output::OutputState;
use crate::render::state_render::RenderState;

pub fn build_overlay_data(state: &RenderState, output: &mut OutputState) {
    let map_mode = state.map_mode;
    let has_selected_entity = state.selected_entity_id.is_some();

    // function for creating tile fill instances (combines multiple functions for different overlay sources)
    let create_fill =
        move |state: &RenderState,
              tile: &Tile,
              output: &mut Vec<GenericFillOverlayInstance>| {
            match map_mode {
                MAP_MODE_TERRAIN => {
                    overlay_functions::fill_mapmode_terrain(state, tile, output)
                }
                MAP_MODE_POLITICAL => {
                    overlay_functions::fill_mapmode_political(state, tile, output)
                }
                MAP_MODE_SETTLEMENT_LOCATIONS => {
                    overlay_functions::fill_mapmode_settlement_locations(state, tile, output)
                }
                _ => overlay_functions::fill_none(state, tile, output),
            }
        };

    // function for creating tile edge instances (combines multiple functions for different overlay sources)
    let create_edge =
        move |state: &RenderState,
              tile: &Tile,
              tiles_by_pos: &FxHashMap<HexPosition, usize>,
              output: &mut Vec<GenericEdgeOverlayInstance>| {
            match map_mode {
                MAP_MODE_TERRAIN => {
                    overlay_functions::edges_mapmode_terrain(state, tile, tiles_by_pos, output)
                }
                MAP_MODE_POLITICAL => overlay_functions::edges_mapmode_political(
                    state,
                    tile,
                    tiles_by_pos,
                    output,
                ),
                MAP_MODE_SETTLEMENT_LOCATIONS => {
                    overlay_functions::edges_mapmode_settlement_locations(
                        state,
                        tile,
                        tiles_by_pos,
                        output,
                    )
                }
                _ => overlay_functions::edges_none(state, tile, tiles_by_pos, output),
            }
            if has_selected_entity {
                overlay_functions::edges_entity_control(state, tile, tiles_by_pos, output)
            }
        };

    // clear previous state
    output.overlay_edge_instances.clear();
    output.overlay_fill_instances.clear();

    // create overlay fill and edge instances for each relevant tile
    state.visible_chunks.iter().for_each(|chunk_key| {
        let chunk = state.chunks.get(chunk_key).unwrap();
        chunk.tiles.iter().for_each(|tile_index| {
            let tile = state.tiles[*tile_index];

            if tile.visibility == TILE_VISIBILITY_UNDISCOVERED {
                return;
            }

            create_fill(state, &tile, &mut output.overlay_fill_instances);
            create_edge(state, &tile, &state.tiles_by_position, &mut output.overlay_edge_instances);
        })
    });
}