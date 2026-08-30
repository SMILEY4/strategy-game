use std::collections::HashSet;
use rustc_hash::FxHashMap;
use crate::js::models::{Control, Entity, HexPosition, Tile};
use crate::render::models::chunk::Chunk;

#[derive(Default)]
pub struct RenderState {
    pub tiles: Vec<Tile>,
    pub tiles_by_position: FxHashMap<HexPosition, usize>,
    pub controls: Vec<Control>,
    pub map_mode: u32,
    pub selected_entity_id: Option<u32>,
    pub entities: Vec<Entity>,
    pub chunks: FxHashMap<HexPosition, Chunk>,
    pub visible_chunks: HashSet<HexPosition>,
}
