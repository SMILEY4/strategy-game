use crate::renderer::models::{BorderData, TileBorderData};
use serde::Deserialize;

#[repr(C, packed)]
#[derive(Copy, Clone)]
pub struct RouteNode {
    pub route_id: i32,

    pub position_q: i32,
    pub position_r: i32,

    pub world_x: f32,
    pub world_y: f32,
}

#[repr(C, packed)]
#[derive(Copy, Clone)]
pub struct WorldObject {
    pub position_q: i32,
    pub position_r: i32,

    pub world_x: f32,
    pub world_y: f32,

    pub country_color_r: f32,
    pub country_color_g: f32,
    pub country_color_b: f32,
}

#[repr(C, packed)]
#[derive(Copy, Clone)]
pub struct Settlement {
    pub position_q: i32,
    pub position_r: i32,

    pub world_x: f32,
    pub world_y: f32,

    pub population_size: i32,

    pub random_0: f32,
    pub random_1: f32,
    pub random_2: f32,
}

#[repr(C, packed)]
#[derive(Copy, Clone)]
pub struct Tile {
    pub position_q: i32,
    pub position_r: i32,

    pub world_x: f32,
    pub world_y: f32,

    pub visibility: u8,

    pub terrain_type: u8,

    pub owner_country_id: u8, // "0" = no owner
    pub owner_country_color_r: f32, // todo: colors could be u8?
    pub owner_country_color_g: f32,
    pub owner_country_color_b: f32,

    pub owner_settlement_id: u8, // "0" = no owner
    pub owner_settlement_color_r: f32,
    pub owner_settlement_color_g: f32,
    pub owner_settlement_color_b: f32,

    pub is_valid_settlement_location: u8,

    pub resource_id: u8, // "0" = no resource
    pub resource_color_r: f32,
    pub resource_color_g: f32,
    pub resource_color_b: f32,
    pub resource_color_a: f32,

    pub height: f32,

    pub random_0: f32,
    pub random_1: f32,
    pub random_2: f32,
}

#[derive(Deserialize, Clone, Hash, Eq, PartialEq)]
pub struct TilePosition {
    pub q: i32,
    pub r: i32,
}

#[derive(Deserialize, Clone)]
pub struct Point {
    pub x: f32,
    pub y: f32,
}

#[derive(Deserialize, Clone)]
pub struct TileSummary {
    pub position: TilePosition,
    pub world_position: Point,
}


#[derive(Deserialize, Clone)]
pub struct TextureAtlasEntry {
    pub name: String,
    pub vertices: Vec<f32>,
    pub texture_coordinates: Vec<f32>,
    pub offset: f32,
    pub scale: f32,
    pub mode: String,
}


pub struct MapMode {
    pub name: &'static str,
    pub fill_color: fn(tile: &Tile) -> [f32; 4],
    pub border_color: fn(tile: &Tile) -> [f32; 4],
    pub border_check: fn(a: &Tile, b: &Tile) -> bool,
    pub border_default: bool,
    pub border_provider: fn(a: &TileBorderData) -> &BorderData,
}

impl MapMode {
    pub const DEFAULT: MapMode = MapMode {
        name: "default",
        fill_color: |tile| {
            return if tile.owner_country_id == 0 {
                [0.0; 4]
            } else {
                [
                    tile.owner_country_color_r,
                    tile.owner_country_color_g,
                    tile.owner_country_color_b,
                    0.7,
                ]
            };
        },
        border_color: |tile| {
            return if tile.owner_country_id == 0 {
                [0.0; 4]
            } else {
                [
                    tile.owner_country_color_r,
                    tile.owner_country_color_g,
                    tile.owner_country_color_b,
                    1.0,
                ]
            };
        },
        border_check: |a, b| a.owner_country_id != b.owner_country_id,
        border_default: true,
        border_provider: |it| &it.countries,
    };

    pub const COUNTRIES: MapMode = MapMode {
        name: "countries",
        fill_color: |tile| {
            return if tile.owner_country_id == 0 {
                [0.0; 4]
            } else {
                [
                    tile.owner_country_color_r,
                    tile.owner_country_color_g,
                    tile.owner_country_color_b,
                    0.7,
                ]
            };
        },
        border_color: |tile| {
            return if tile.owner_country_id == 0 {
                [0.0; 4]
            } else {
                [
                    tile.owner_country_color_r,
                    tile.owner_country_color_g,
                    tile.owner_country_color_b,
                    1.0,
                ]
            };
        },
        border_check: |a, b| a.owner_country_id != b.owner_country_id,
        border_default: true,
        border_provider: |it| &it.countries,
    };

    pub const SETTLEMENTS: MapMode = MapMode {
        name: "settlements",
        fill_color: |tile| {
            return if tile.owner_settlement_id == 0 {
                [0.0; 4]
            } else {
                [
                    tile.owner_settlement_color_r,
                    tile.owner_settlement_color_g,
                    tile.owner_settlement_color_b,
                    0.7,
                ]
            };
        },
        border_color: |tile| {
            return if tile.owner_settlement_id == 0 {
                [0.0; 4]
            } else {
                [
                    tile.owner_settlement_color_r,
                    tile.owner_settlement_color_g,
                    tile.owner_settlement_color_b,
                    1.0,
                ]
            };
        },
        border_check: |a, b| a.owner_settlement_id != b.owner_settlement_id,
        border_default: true,
        border_provider: |it| &it.settlements,
    };

    pub const SETTLEMENT_LOCATIONS: MapMode = MapMode {
        name: "settlement_locations",
        fill_color: |tile| {
            if tile.is_valid_settlement_location == 1 {
                [50.0 / 255.0, 194.0 / 255.0, 73.0 / 255.0, 0.9]
            } else {
                [0.0; 4]
            }
        },
        border_color: |_| [0.0; 4],
        border_check: |_, _| false,
        border_default: false,
        border_provider: |it| &it.none,
    };

    pub const RESOURCES: MapMode = MapMode {
        name: "resources",
        fill_color: |tile| {
            return if tile.resource_id == 0 {
                [0.0; 4]
            } else {
                [
                    tile.resource_color_r,
                    tile.resource_color_g,
                    tile.resource_color_b,
                    tile.resource_color_a
                ]
            }
        },
        border_color: |_| [0.0; 4],
        border_check: |_, _| false,
        border_default: false,
        border_provider: |it| &it.none,
    };

    pub const TERRAIN: MapMode = MapMode {
        name: "terrain",
        fill_color: |_| [0.0; 4],
        border_color: |_| [0.0; 4],
        border_check: |_, _| false,
        border_default: false,
        border_provider: |it| &it.none,
    };
}
