use crate::renderer::models::{BorderData, TileBorderData};
use serde::Deserialize;

#[repr(C, packed)]
#[derive(Copy, Clone)]
pub struct WorldObject {
    pub position_q: i32,
    pub position_r: i32,

    pub world_x: f32,
    pub world_y: f32,

    pub realm_color_r: u8,
    pub realm_color_g: u8,
    pub realm_color_b: u8,

    pub type_group: u8,
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

    pub resource_id: u8, // "0" = no resource
    pub resource_color_r: u8,
    pub resource_color_g: u8,
    pub resource_color_b: u8,
    pub resource_color_a: u8,

    pub height: f32,

    pub rng_seed: u32
}

#[derive(Deserialize, Clone, Hash, Eq, PartialEq)]
pub struct TilePosition {
    pub q: i32,
    pub r: i32,
}

#[derive(Deserialize, Clone)]
pub struct TextureAtlasEntry {
    pub vertices: Vec<f32>,
    pub texture_coordinates: Vec<f32>,
    pub offset: f32,
    pub scale: f32,
    pub mode: String,
}


pub struct MapMode {
    pub fill_color: fn(tile: &Tile) -> [f32; 4],
    pub border_color: fn(tile: &Tile) -> [f32; 4],
    pub border_check: fn(a: &Tile, b: &Tile) -> bool,
    pub border_default: bool,
    pub border_provider: fn(a: &TileBorderData) -> &BorderData,
}

impl MapMode {
    pub const DEFAULT: MapMode = MapMode {
        fill_color: |_| [0.0; 4],
        border_color: |_| [0.0; 4],
        border_check: |_, _| false,
        border_default: false,
        border_provider: |it| &it.none,
    };

    pub const RESOURCES: MapMode = MapMode {
        fill_color: |tile| {
            return if tile.resource_id == 0 {
                [0.0; 4]
            } else {
                [
                    tile.resource_color_r as f32 / 255.0,
                    tile.resource_color_g as f32 / 255.0,
                    tile.resource_color_b as f32 / 255.0,
                    tile.resource_color_a as f32 / 255.0
                ]
            }
        },
        border_color: |_| [0.0; 4],
        border_check: |_, _| false,
        border_default: false,
        border_provider: |it| &it.none,
    };

    pub const TERRAIN: MapMode = MapMode {
        fill_color: |_| [0.0; 4],
        border_color: |_| [0.0; 4],
        border_check: |_, _| false,
        border_default: false,
        border_provider: |it| &it.none,
    };
}
