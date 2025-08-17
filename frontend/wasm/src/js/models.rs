use serde::Deserialize;
use crate::renderer::models::{BorderData, TileBorderData};

#[derive(Deserialize, Clone)]
pub struct Tile {
    pub position: TilePosition,
    pub world_position: Point,
    pub visibility: u8,
    pub terrain_type: u8,
    pub owner_country_id: Option<String>,
    pub owner_country_color: Option<[f32; 3]>,
    pub owner_settlement_id: Option<String>,
    pub owner_settlement_color: Option<[f32; 3]>,
    pub is_valid_settlement_location: bool,
    pub resource_color: Option<[f32; 4]>,
    pub height: f32,
    pub random_0: f32,
    pub random_1: f32,
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
        fill_color: |tile| { tile.owner_country_color.map(|it| [it[0], it[1], it[2], 0.7]).unwrap_or([0.0; 4]) },
        border_color: |tile| { tile.owner_country_color.map(|it| [it[0], it[1], it[2], 1.0]).unwrap_or([0.0; 4]) },
        border_check: |a, b| {
            let default = String::new();
            let owner_a = a.owner_country_id.as_ref().unwrap_or(&default);
            let owner_b = b.owner_country_id.as_ref().unwrap_or(&default);
            owner_a != owner_b
        },
        border_default: true,
        border_provider: |it| &it.countries
    };

    pub const COUNTRIES: MapMode = MapMode {
        name: "countries",
        fill_color: |tile| { tile.owner_country_color.map(|it| [it[0], it[1], it[2], 1.0]).unwrap_or([0.0; 4]) },
        border_color: |tile| { tile.owner_country_color.map(|it| [it[0], it[1], it[2], 1.0]).unwrap_or([0.0; 4]) },
        border_check: |a, b| {
            let default = String::new();
            let owner_a = a.owner_country_id.as_ref().unwrap_or(&default);
            let owner_b = b.owner_country_id.as_ref().unwrap_or(&default);
            owner_a != owner_b
        },
        border_default: true,
        border_provider: |it| &it.countries
    };

    pub const SETTLEMENTS: MapMode = MapMode {
        name: "settlements",
        fill_color: |tile| { tile.owner_settlement_color.map(|it| [it[0], it[1], it[2], 1.0]).unwrap_or([0.0; 4]) },
        border_color: |tile| { tile.owner_settlement_color.map(|it| [it[0], it[1], it[2], 1.0]).unwrap_or([0.0; 4]) },
        border_check: |a, b| {
            let default = String::new();
            let owner_a = a.owner_settlement_id.as_ref().unwrap_or(&default);
            let owner_b = b.owner_settlement_id.as_ref().unwrap_or(&default);
            owner_a != owner_b
        },
        border_default: true,
        border_provider: |it| &it.settlements
    };

    pub const SETTLEMENT_LOCATIONS: MapMode = MapMode {
        name: "settlement_locations",
        fill_color: |tile| { if(tile.is_valid_settlement_location) { [50.0 / 255.0, 194.0 / 255.0, 73.0 / 255.0, 0.9] } else { [0.0; 4]} },
        border_color: |_| { [0.0; 4] },
        border_check: |_, _| { false },
        border_default: false,
        border_provider: |it| &it.none
    };

    pub const RESOURCES: MapMode = MapMode {
        name: "resources",
        fill_color: |tile| { tile.resource_color.unwrap_or([0.0; 4] ) },
        border_color: |_| { [0.0; 4] },
        border_check: |_, _| { false },
        border_default: false,
        border_provider: |it| &it.none
    };

    pub const TERRAIN: MapMode = MapMode {
        name: "terrain",
        fill_color: |_| { [0.0; 4] },
        border_color: |_| { [0.0; 4] },
        border_check: |_, _| { false },
        border_default: false,
        border_provider: |it| &it.none
    };

}