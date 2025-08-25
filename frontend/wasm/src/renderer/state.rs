use std::collections::{HashMap, HashSet};
use crate::js::models::{RouteNode, Settlement, TextureAtlasEntry, Tile, TilePosition, WorldObject};
use crate::renderer::models::{TileBorderData};
use crate::utils::Rect2d;

#[derive(Default)]
pub struct RenderState {
    pub relevant_world_area: Rect2d,
    pub tiles: Vec<Tile>,
    pub relevant_tile_indices: Vec<usize>,
    pub settlements: Vec<Settlement>,
    pub world_objects: Vec<WorldObject>,
    pub move_targets: HashSet<TilePosition>,
    pub routes: Vec<Vec<RouteNode>>,
    pub borders: Vec<TileBorderData>,
    pub map_mode: String,
    pub texture_atlas_entries: HashMap<String, Vec<TextureAtlasEntry>>,
}