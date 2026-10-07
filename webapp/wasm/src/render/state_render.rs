use crate::js::models::{Control, Entity, HexPosition, Tile};
use crate::render::models::chunk::Chunk;
use crate::render::models::route_segment::RouteSegment;
use crate::render::MapMode;
use rustc_hash::FxHashMap;
use std::collections::HashSet;
use crate::render::models::realm_color::RealmColor;

impl RenderState {
    pub fn visible_tile_indices(&self) -> impl Iterator<Item = usize> + '_ {
        self.visible_chunks
            .iter()
            .filter_map(|chunk_key| self.chunks.get(chunk_key))
            .flat_map(|chunk| chunk.tiles.iter().copied())
    }

    pub fn visible_tiles(&self) -> impl Iterator<Item = Tile> + '_ {
        self.visible_tile_indices().map(|index| self.tiles[index])
    }

    pub fn visible_entity_indices(&self) -> impl Iterator<Item = usize> + '_ {
        self.visible_chunks
            .iter()
            .filter_map(|chunk_key| self.chunks.get(chunk_key))
            .flat_map(|chunk| chunk.entities.iter().copied())
    }

    pub fn visible_entities(&self) -> impl Iterator<Item = Entity> + '_ {
        self.visible_entity_indices().map(|index| self.entities[index])
    }
}

#[derive(Default)]
pub struct RenderState {
    pub tiles: Vec<Tile>,
    pub controls: Vec<Control>,
    pub realm_colors: FxHashMap<u32, RealmColor>,
    pub entities: Vec<Entity>,
    pub route_segments: Vec<RouteSegment>,
    pub map_mode: MapMode,
    pub selected_settlement_id: Option<u32>,
    pub selected_entity_id: Option<u32>,
    pub tiles_by_position: FxHashMap<HexPosition, usize>,
    pub chunks: FxHashMap<HexPosition, Chunk>,
    pub visible_chunks: HashSet<HexPosition>,
}
