use crate::js::models::Tile;
use crate::renderer::models::{TileBorderData, VertexData};

#[derive(Default)]
pub struct RenderState {
    pub tiles: Vec<Tile>,
    pub borders: Vec<TileBorderData>,
    pub vertex_data: VertexData,
}

impl RenderState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn set_tiles(&mut self, tiles: Vec<Tile>) {
        self.tiles = tiles;
        self.borders.clear()
    }
}
