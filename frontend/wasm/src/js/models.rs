use serde::Deserialize;

#[derive(Deserialize, Clone)]
pub struct Tile {
    pub id: String,
    pub position: TilePosition,
    pub world_position: Point,
    pub visibility: u8,
    pub terrain_type: u8,
    pub height: f32,
    pub random_0: f32,
    pub random_1: f32,
}

#[derive(Deserialize, Clone)]
pub struct TilePosition {
    pub q: i32,
    pub r: i32,
}

#[derive(Deserialize, Clone)]
pub struct Point {
    pub x: f32,
    pub y: f32,
}