use rustc_hash::FxHashMap;
use crate::js::models::{Entity, HexPosition, Tile};
use crate::render::models::chunk::Chunk;

// Calculate the list of all chunks associated with the given tiles and entities
pub fn calculate_chunks(tiles: &Vec<Tile>, entities: &Vec<Entity>) -> FxHashMap<HexPosition, Chunk> {
    let mut chunks: FxHashMap<HexPosition, Chunk> = FxHashMap::default();

    // create (missing) chunks from tiles; link with associated tiles
    for (index, tile) in tiles.iter().enumerate() {
        chunks
            .entry(tile.chunk_position)
            .or_insert_with(|| Chunk {
                chunk_position: tile.chunk_position,
                tiles: Vec::new(),
                entities: Vec::new(),
            })
            .tiles
            .push(index);
    }

    // create (missing) chunks from entities; link with associated entities
    for (index, entity) in entities.iter().enumerate() {
        chunks
            .entry(entity.chunk_position)
            .or_insert_with(|| Chunk {
                chunk_position: entity.chunk_position,
                tiles: Vec::new(),
                entities: Vec::new(),
            })
            .entities
            .push(index);
    }

    chunks
}

// Check whether the chunks changed (i.e. any chunks added or removed).
// This does not check whether the content of chunks has changed. 
pub fn check_changes(before: &FxHashMap<HexPosition, Chunk>, after: &FxHashMap<HexPosition, Chunk>) -> bool {
    before.len() != after.len() || before.keys().any(|key| !after.contains_key(key))
}