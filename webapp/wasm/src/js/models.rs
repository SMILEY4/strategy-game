use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[repr(C, packed)]
#[derive(Copy, Clone, Debug)]
pub struct Tile {
    pub tile_position: HexPosition,
    pub chunk_position: HexPosition,
    pub world_position: WorldPosition,
    pub visibility: u8, // 0 = not discovered, 1 = discovered not visible, 2 = visible
    pub terrain: u8,    // 0 = water, 1 = land
    pub rng_seed: u32,
}

#[repr(C, packed)]
#[derive(Copy, Clone, Debug)]
pub struct Entity {
    pub tile_position: HexPosition,
    pub chunk_position: HexPosition,
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq)]
pub struct HexPosition {
    pub q: i32,
    pub r: i32,
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct WorldPosition {
    pub x: f32,
    pub y: f32,
}

#[derive(Tsify, Deserialize)]
#[tsify(from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct UvRectangle {
    pub u_min: f32,
    pub v_min: f32,
    pub u_max: f32,
    pub v_max: f32,
}

#[derive(Tsify,  Deserialize)]
#[tsify(from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct Size {
    pub width: f32,
    pub height: f32,
}

#[derive(Tsify, Deserialize)]
#[tsify(from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct SpriteSheetEntry {
    pub id: String,
    pub uv_coords: UvRectangle,
    pub n_size: Size,
    pub weight: f32,
}