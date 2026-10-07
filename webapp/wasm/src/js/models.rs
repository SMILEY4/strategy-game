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
    pub visibility: TileVisibility,
    pub terrain: TileTerrain,
    pub owner_realm: u32,
    pub conversion_active: bool,
    pub converting_realm: u32,
    pub control_offset: u32,
    pub control_count: u32,
    pub create_settlement_validity: CreateSettlementValidity,
    pub rng_seed: u32,
}

#[repr(C, packed)]
#[derive(Copy, Clone, Debug)]
pub struct Control {
    pub realm_id: u32,
    pub settlement_id: u32,
    pub entity_id: u32,
    pub amount: f32,
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq)]
pub struct TileTerrain {
    pub elevation: TileElevation,
    pub biome: TileBiome,
    pub feature: TileFeature,
}

#[repr(u8)]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum TileVisibility {
    Undiscovered = 0,
    Discovered = 1,
    Visible = 2,
}

#[repr(u8)]
#[derive(Clone, Copy, Debug, Eq, PartialEq, Hash)]
pub enum TileElevation {
    Undefined = 0,
    Flat = 1,
    Hills = 2,
    Mountains = 3,
}

#[repr(u8)]
#[derive(Clone, Copy, Debug, Eq, PartialEq, Hash)]
pub enum TileBiome {
    Undefined = 0,
    Ocean = 1,
    Grassland = 2,
}

#[repr(u8)]
#[derive(Clone, Copy, Debug, Eq, PartialEq, Hash)]
pub enum TileFeature {
    Undefined = 0,
    Forest = 1,
}

#[repr(u8)]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum CreateSettlementValidity {
    Invalid = 0,
    ValidTerrain = 1,
    Valid = 2,
}

#[repr(u8)]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum EntityType {
    Settlement = 1,
    TileImprovement = 2,
}

#[repr(C, packed)]
#[derive(Copy, Clone, Debug)]
pub struct Entity {
    pub tile_position: HexPosition,
    pub chunk_position: HexPosition,
    pub render_type: EntityType,
    pub is_pending: bool,
    pub improvement_key: [u8; 64],
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq)]
pub struct HexPosition {
    pub q: i32,
    pub r: i32,
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
    pub name: String,
    pub uv_coords: UvRectangle,
    pub n_size: Size,
    pub scale: f32,
}


#[repr(C, packed)]
#[derive(Copy, Clone, Debug)]
pub struct RoutePoint {
    pub route_id: u32, // id of the route this point belongs to
    pub route_from: u32, // entity at the start of this route
    pub route_to: u32, // entity at the end of this route
    pub tile_position: HexPosition, // hex position of this point
}
