use crate::js::models::{HexPosition};

pub struct Chunk {
    pub chunk_position: HexPosition,
    pub tiles: Vec<usize>,
}