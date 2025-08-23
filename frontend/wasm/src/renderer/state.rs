use std::collections::{HashMap, HashSet};
use crate::js::models::{Settlement, TextureAtlasEntry, Tile, TilePosition, WorldObject};
use crate::renderer::models::{TileBorderData};

#[derive(Default)]
pub struct RenderState {
    pub tiles: Vec<Tile>,
    pub settlements: Vec<Settlement>,
    pub world_objects: Vec<WorldObject>,
    pub move_targets: HashSet<TilePosition>,
    pub borders: Vec<TileBorderData>,
    pub map_mode: String,
    pub texture_atlas_entries: HashMap<String, Vec<TextureAtlasEntry>>,
}
