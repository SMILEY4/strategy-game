use crate::js::models::Tile;

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct LandTileVertex {
    pub position: [f32; 2],
    pub color: [f32; 3],
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct WaterTileVertex {
    pub position: [f32; 2],
    pub depth: f32,
    pub border_mask: u32, // todo: optimize data types (i.e. u8) here and in webgl vao
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct FogTileVertex {
    pub position: [f32; 2],
    pub visibility: i32,
}

#[derive(Default)]
pub struct VertexData {
    pub land: Vec<LandTileVertex>,
    pub water: Vec<WaterTileVertex>,
    pub fog: Vec<FogTileVertex>,
}

#[derive(Default)]
pub struct TileData {
    pub tiles: Vec<Tile>,
    pub borders: Vec<TileBorderData>,
}

#[derive(Debug)]
pub struct TileBorderData {
    pub coast: BorderData,
}

#[derive(Debug)]
pub struct BorderData {
    pub right: bool,
    pub top_right: bool,
    pub top_left: bool,
    pub left: bool,
    pub bottom_left: bool,
    pub bottom_right: bool,
}

