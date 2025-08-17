use std::collections::HashSet;
use crate::js::models::{Tile, TilePosition};
use crate::renderer::models::{TileBorderData, VertexData};

#[derive(Default)]
pub struct RenderState {
    pub tiles: Vec<Tile>,
    pub move_targets: HashSet<TilePosition>,
    pub borders: Vec<TileBorderData>,
    pub vertex_data: VertexData,
    pub map_mode: String,
}
