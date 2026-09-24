use crate::js::models::{Control, Entity, HexPosition, Tile};
use crate::render::models::chunk::Chunk;
use crate::render::models::RouteSegment::RouteSegment;
use rustc_hash::FxHashMap;
use std::collections::HashSet;

#[derive(Clone, Copy)]
pub struct RealmColor {
    pub red: f32,
    pub green: f32,
    pub blue: f32,
}

impl RealmColor {
    pub fn from_rgb(red: u8, green: u8, blue: u8) -> Self {
        Self {
            red: red as f32 / 255.0,
            green: green as f32 / 255.0,
            blue: blue as f32 / 255.0,
        }
    }

    pub fn with_alpha(self, alpha: f32) -> [f32; 4] {
        [self.red, self.green, self.blue, alpha]
    }
}

#[derive(Default)]
pub struct RenderState {
    pub tiles: Vec<Tile>,
    pub controls: Vec<Control>,
    pub realm_colors: FxHashMap<u32, RealmColor>,
    pub entities: Vec<Entity>,
    pub route_segments: Vec<RouteSegment>,
    pub map_mode: u32,
    pub selected_settlement_id: Option<u32>,
    pub selected_entity_id: Option<u32>,
    pub tiles_by_position: FxHashMap<HexPosition, usize>,
    pub chunks: FxHashMap<HexPosition, Chunk>,
    pub visible_chunks: HashSet<HexPosition>,
}
