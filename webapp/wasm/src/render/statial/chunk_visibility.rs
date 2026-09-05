use crate::js::models::HexPosition;
use crate::render::models::chunk::Chunk;
use rustc_hash::FxHashMap;
use std::collections::HashSet;

pub fn calculate_visible_chunks(chunks: &FxHashMap<HexPosition, Chunk>) -> HashSet<HexPosition> {
    chunks
        .iter()
        .filter(|(pos, chunk)| is_visible(pos, chunk))
        .map(|(&pos, _)| pos)
        .collect()
}

fn is_visible(pos: &HexPosition, chunk: &Chunk) -> bool {
    true // todo: implement later
}