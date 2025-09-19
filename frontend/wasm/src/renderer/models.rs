use std::collections::{HashMap, HashSet};
use crate::js::models::{TextureAtlasEntry, Tile, TilePosition, WorldObject};
use crate::utils::Rect2d;

#[derive(Clone)]
pub struct RendererConfiguration {
    pub land_color_light: [f32; 3],
    pub land_color_dark: [f32; 3],
    pub tile_width: f32,
    pub tile_height: f32,
    pub route_line_thickness: f32,
    pub route_rng_offset: f32,
    pub move_target_color: [f32; 4],
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct LandTileVertex {
    pub position: [f32; 2],
    pub color: [u8; 3],
    pub _padding: u8,
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct WaterTileVertex {
    pub position: [f32; 2],
    pub depth: f32,
    pub border_mask: u8,
    pub _padding: [u8; 3],
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct FogTileVertex {
    pub position: [f32; 2],
    pub visibility: i32,
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct OverlayTileVertex {
    pub position: [f32; 2],
    pub tile_position: [i32; 2],
    pub primary_border_mask: u8,
    pub primary_border_color: [u8; 4],
    pub primary_fill_color: [u8; 4],
    pub is_highlighted: u8,
    pub _padding: [u8; 2],
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct MapDetailVertex {
    pub position: [f32; 3],
    pub texture_coordinates: [f32; 2],
    pub base_color: [u8; 3],
    pub country_color: [u8; 3],
    pub _padding: [u8; 2],
}

#[derive(Default)]
pub struct RenderState {
    pub relevant_world_area: Rect2d,
    pub tiles: Vec<Tile>,
    pub relevant_tile_indices: Vec<usize>,
    pub world_objects: Vec<WorldObject>,
    pub move_targets: HashSet<TilePosition>,
    pub borders: Vec<TileBorderData>,
    pub map_mode: String,
    pub texture_atlas_entries: HashMap<String, Vec<TextureAtlasEntry>>,
}

#[derive(Default)]
pub struct VertexData {
    pub land: Vec<LandTileVertex>,
    pub water: Vec<WaterTileVertex>,
    pub fog: Vec<FogTileVertex>,
    pub overlay: Vec<OverlayTileVertex>,
    pub map_detail: Vec<MapDetailVertex>,
}

#[derive(Debug)]
pub struct TileBorderData {
    pub none: BorderData,
    pub coast: BorderData,
}

#[derive(Debug, Copy, Clone)]
pub struct BorderData {
    pub right: bool,
    pub top_right: bool,
    pub top_left: bool,
    pub left: bool,
    pub bottom_left: bool,
    pub bottom_right: bool,
}