use crate::js::models::{MapMode, Tile};
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

/// Compute all border data for all given tiles. The indices of the input and output arrays match.
pub fn build_tile_borders(tiles: &Vec<Tile>) -> Vec<TileBorderData> {

    // build map of "tile position" -> "tile"
    let tiles_by_position = tiles
        .iter()
        .map(|it| ((it.position_q, it.position_r), it))
        .collect::<HashMap<(i32, i32), &Tile>>();

    // build border data for each tile and for each border
    let borders = tiles
        .iter()
        .map(|it| build_tile_border(it, &tiles_by_position))
        .collect::<Vec<TileBorderData>>();

    borders
}

/// Compute all border data for the given tile
fn build_tile_border(
    tile: &Tile,
    tiles_by_position: &HashMap<(i32, i32), &Tile>,
) -> TileBorderData {

    let tile_right        = tiles_by_position.get(&(tile.position_q + 1, tile.position_r + 0));
    let tile_top_right    = tiles_by_position.get(&(tile.position_q + 0, tile.position_r + 1));
    let tile_top_left     = tiles_by_position.get(&(tile.position_q - 1, tile.position_r + 1));
    let tile_left         = tiles_by_position.get(&(tile.position_q - 1, tile.position_r + 0));
    let tile_bottom_left  = tiles_by_position.get(&(tile.position_q + 0, tile.position_r - 1));
    let tile_bottom_right = tiles_by_position.get(&(tile.position_q + 1, tile.position_r - 1));

    TileBorderData {
        none: BorderData {
            right: false,
            top_right: false,
            top_left: false,
            left: false,
            bottom_left: false,
            bottom_right: false,
        },
        coast: build_border(
            false,
            |a, b| { (a.terrain_type == 1 || b.terrain_type == 1) && a.terrain_type != b.terrain_type },
            tile,
            tile_right,
            tile_top_right,
            tile_top_left,
            tile_left,
            tile_bottom_left,
            tile_bottom_right,
        ),
    }
}

/// Compute a specific border for the given tile
fn build_border(
    border_default: bool,
    border_test: fn(&Tile, &Tile) -> bool,
    tile_center: &Tile,
    tile_right: Option<&&Tile>,
    tile_top_right: Option<&&Tile>,
    tile_top_left: Option<&&Tile>,
    tile_left: Option<&&Tile>,
    tile_bottom_left: Option<&&Tile>,
    tile_bottom_right: Option<&&Tile>
) -> BorderData {
    BorderData {
        right: tile_right.map(|it| border_test(tile_center, it)).unwrap_or(border_default),
        top_right: tile_top_right.map(|it| border_test(tile_center, it)).unwrap_or(border_default),
        top_left: tile_top_left.map(|it| border_test(tile_center, it)).unwrap_or(border_default),
        left: tile_left.map(|it| border_test(tile_center, it)).unwrap_or(border_default),
        bottom_left: tile_bottom_left.map(|it| border_test(tile_center, it)).unwrap_or(border_default),
        bottom_right: tile_bottom_right.map(|it| border_test(tile_center, it)).unwrap_or(border_default),
    }
}
