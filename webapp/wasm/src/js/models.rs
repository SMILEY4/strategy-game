#[repr(C, packed)]
#[derive(Copy, Clone, Debug)]
pub struct Tile {
    pub tile_position: HexPosition,
    pub chunk_position: HexPosition,
    pub world_position: WorldPosition,
    pub terrain: u8,
    pub rng_seed: u32
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq)]
pub struct HexPosition {
    pub q: i32,
    pub r: i32,
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct WorldPosition {
    pub x: f32,
    pub y: f32,
}

// #[repr(u8)]
// #[derive(Copy, Clone, Debug, PartialEq, Eq)]
// pub enum TerrainType {
//     Water = 0,
//     Land = 1,
// }