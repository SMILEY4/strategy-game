use crate::api::Tile;
use std::collections::HashMap;

#[derive(Debug)]
pub struct BorderData {
    right: bool,
    top_right: bool,
    top_left: bool,
    left: bool,
    bottom_left: bool,
    bottom_right: bool,
}

#[derive(Debug)]
pub struct TileBorderData {
    pub coast: BorderData,
}

pub fn pack(border: &BorderData) -> u32 {
    let mut packed: u32 = 0;
    packed |= (if border.right { 1 } else { 0 }) << 0;
    packed |= (if border.top_right { 1 } else { 0 }) << 1;
    packed |= (if border.top_left { 1 } else { 0 }) << 2;
    packed |= (if border.left { 1 } else { 0 }) << 3;
    packed |= (if border.bottom_left { 1 } else { 0 }) << 4;
    packed |= (if border.bottom_right { 1 } else { 0 }) << 5;
    packed
}

pub fn build_borders(tiles: &Vec<Tile>) -> Vec<TileBorderData> {
    // build map of "tile position" -> "tile"
    let mut tiles_by_position: HashMap<(i32, i32), &Tile> = HashMap::new();
    for tile in tiles {
        tiles_by_position.insert((tile.position.q, tile.position.r), tile);
    }

    // build border data for each tile and for each border
    let mut tile_border_data = Vec::with_capacity(tiles.len());
    for tile in tiles {
        tile_border_data.push(TileBorderData {
            coast: build_border(&tile, &tiles_by_position, false, border_check_coastline),
        });
    }

    tile_border_data
}

fn border_check_coastline(a: &Tile, b: &Tile) -> bool {
    (a.terrain_type == 1 || b.terrain_type == 1) && a.terrain_type != b.terrain_type
}

fn build_border(
    tile: &Tile,
    by_pos: &HashMap<(i32, i32), &Tile>,
    border_default: bool,
    border_test: fn(&Tile, &Tile) -> bool,
) -> BorderData {
    let tile_q = tile.position.q;
    let tile_r = tile.position.r;
    BorderData {
        right: by_pos
            .get(&(tile_q + 1, tile_r + 0))
            .map(|it| border_test(tile, it))
            .unwrap_or(border_default),
        top_right: by_pos
            .get(&(tile_q + 0, tile_r + 1))
            .map(|it| border_test(tile, it))
            .unwrap_or(border_default),
        top_left: by_pos
            .get(&(tile_q - 1, tile_r + 1))
            .map(|it| border_test(tile, it))
            .unwrap_or(border_default),
        left: by_pos
            .get(&(tile_q - 1, tile_r + 0))
            .map(|it| border_test(tile, it))
            .unwrap_or(border_default),
        bottom_left: by_pos
            .get(&(tile_q + 0, tile_r - 1))
            .map(|it| border_test(tile, it))
            .unwrap_or(border_default),
        bottom_right: by_pos
            .get(&(tile_q + 1, tile_r - 1))
            .map(|it| border_test(tile, it))
            .unwrap_or(border_default),
    }
}
