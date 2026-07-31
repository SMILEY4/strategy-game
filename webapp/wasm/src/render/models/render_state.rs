use std::collections::{HashMap, HashSet};
use crate::js::models::{HexPosition, Tile};
use crate::render::models::chunk::Chunk;

#[derive(Default)]
pub struct RenderState {
    pub tiles: Vec<Tile>,
    pub chunks: HashMap<HexPosition, Chunk>,
    pub visible_chunks: HashSet<HexPosition>,
}