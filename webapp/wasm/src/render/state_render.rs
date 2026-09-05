use crate::js::models::{Control, Entity, HexPosition, Tile};
use crate::render::models::chunk::Chunk;
use rustc_hash::FxHashMap;
use std::collections::HashSet;

#[derive(Default)]
pub struct RenderState {
    pub tiles: Vec<Tile>,
    pub controls: Vec<Control>,
    pub entities: Vec<Entity>,
    pub map_mode: u32,
    pub selected_entity_id: Option<u32>,
    pub tiles_by_position: FxHashMap<HexPosition, usize>,
    pub chunks: FxHashMap<HexPosition, Chunk>,
    pub visible_chunks: HashSet<HexPosition>,
}
