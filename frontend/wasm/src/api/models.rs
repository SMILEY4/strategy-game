use serde::Deserialize;

#[derive(Deserialize, Clone)]
pub struct Tile {
    pub position: TilePosition,
}

#[derive(Deserialize, Clone)]
pub struct TilePosition {
    pub q: i32,
    pub r: i32,
}