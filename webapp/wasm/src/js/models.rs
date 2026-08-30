use serde::Deserialize;
use tsify::Tsify;

pub const SPRITE_ATLAS_MOUNTAINS: i32 = 1;
pub const SPRITE_ATLAS_HILLS: i32 = 2;
pub const SPRITE_ATLAS_TREES: i32 = 3;

#[repr(C, packed)]
#[derive(Copy, Clone, Debug)]
pub struct Tile {
    pub tile_position: HexPosition,
    pub chunk_position: HexPosition,
    pub visibility: u8,
    pub terrain: TileTerrain,
    pub rng_seed: u32,
    pub control_offset: u32,
    pub control_count: u32,
}

#[repr(C, packed)]
#[derive(Copy, Clone, Debug)]
pub struct Control {
    pub realm_id: u32,
    pub entity_id: u32,
    pub amount: f32,
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq)]
pub struct TileTerrain {
    pub elevation: u8,
    pub biome: u8,
    pub feature: u8,
}

pub const TILE_VISIBILITY_UNDISCOVERED: u8 = 0;
pub const TILE_VISIBILITY_DISCOVERED: u8 = 1;
pub const TILE_VISIBILITY_VISIBLE: u8 = 2;

pub const TILE_ELEVATION_UNDEF: u8 = 0;
pub const TILE_ELEVATION_FLAT: u8 = 1;
pub const TILE_ELEVATION_HILLS: u8 = 2;
pub const TILE_ELEVATION_MOUNTAINS: u8 = 3;

pub const TILE_BIOME_UNDEF: u8 = 0;
pub const TILE_BIOME_OCEAN: u8 = 1;
pub const TILE_BIOME_GRASSLAND: u8 = 2;

pub const TILE_FEATURE_UNDEF: u8 = 0;
pub const TILE_FEATURE_FOREST: u8 = 1;

pub const ENTITY_TYPE_SETTLEMENT: u8 = 1;

#[repr(C, packed)]
#[derive(Copy, Clone, Debug)]
pub struct Entity {
    pub tile_position: HexPosition,
    pub chunk_position: HexPosition,
    pub render_type: u8,
    pub is_pending: bool,
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

#[derive(Tsify, Deserialize)]
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
    pub scale: f32,
}
