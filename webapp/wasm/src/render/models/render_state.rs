use std::collections::{HashMap, HashSet};
use crate::js::models::{Control, Entity, HexPosition, Tile};
use crate::render::models::chunk::Chunk;

#[derive(Default)]
pub struct RenderState {
    pub tiles: Vec<Tile>,
    pub controls: Vec<Control>,
    pub player_ids: Vec<String>,
    pub settlement_ids: Vec<String>,
    pub entities: Vec<Entity>,
    pub chunks: HashMap<HexPosition, Chunk>,
    pub visible_chunks: HashSet<HexPosition>,
}
