use crate::js::models::Tile;
use crate::renderer::models::{BorderData, TileBorderData};
use std::collections::HashMap;

/// packs the information from the given `border` into the bits of an unsigned integer
/// Order of neighbours/direction from least to most significant bit:
/// 1. right neighbor
/// 2. top right neighbor
/// 3. top left neighbor
/// 4. left neighbor
/// 5. bottom left neighbor
/// 6. bottom right neighbor
pub fn pack(border: &BorderData) -> u8 {
    let mut packed: u8 = 0;
    packed |= (if border.right { 1 } else { 0 }) << 0;
    packed |= (if border.top_right { 1 } else { 0 }) << 1;
    packed |= (if border.top_left { 1 } else { 0 }) << 2;
    packed |= (if border.left { 1 } else { 0 }) << 3;
    packed |= (if border.bottom_left { 1 } else { 0 }) << 4;
    packed |= (if border.bottom_right { 1 } else { 0 }) << 5;
    packed
}

/// compute all border data for all given tiles. The indices of the input and output arrays match.
pub fn build_tile_borders(tiles: &Vec<Tile>) -> Vec<TileBorderData> {
    // build map of "tile position" -> "tile"
    let tiles_by_position = tiles
        .iter()
        .map(|it| ((it.position.q, it.position.r), it))
        .collect::<HashMap<(i32, i32), &Tile>>();

    // build border data for each tile and for each border
    let borders = tiles
        .iter()
        .map(|it| build_tile_border(it, &tiles_by_position))
        .collect::<Vec<TileBorderData>>();

    borders
}

/// compute all border data for the given tile
fn build_tile_border(
    tile: &Tile,
    tiles_by_position: &HashMap<(i32, i32), &Tile>,
) -> TileBorderData {
    TileBorderData {
        coast: build_border(tile, &tiles_by_position, false, |a, b| {
            (a.terrain_type == 1 || b.terrain_type == 1) && a.terrain_type != b.terrain_type
        }),
    }
}

/// compute a specific border for the given tile
fn build_border(tile: &Tile, by_pos: &HashMap<(i32, i32), &Tile>, border_default: bool, border_test: fn(&Tile, &Tile) -> bool) -> BorderData {
    BorderData {
        right: build_direction_border((1, 0), tile, by_pos, border_test, border_default),
        top_right: build_direction_border((0, 1), tile, by_pos, border_test, border_default),
        top_left: build_direction_border((-1, 1), tile, by_pos, border_test, border_default),
        left: build_direction_border((-1, 0), tile, by_pos, border_test, border_default),
        bottom_left: build_direction_border((0, -1), tile, by_pos, border_test, border_default),
        bottom_right: build_direction_border((1, -1), tile, by_pos, border_test, border_default),
    }
}

/// compute a specific border for the given tile and specific direction/neighbour
fn build_direction_border(
    offset: (i32, i32),
    tile: &Tile,
    by_pos: &HashMap<(i32, i32), &Tile>,
    border_test: fn(&Tile, &Tile) -> bool,
    border_default: bool
) -> bool {
    by_pos
        .get(&(tile.position.q + offset.0, tile.position.r + offset.1))
        .map(|it| border_test(tile, it))
        .unwrap_or(border_default)
}
