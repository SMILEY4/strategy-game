#[derive(Default)]
pub struct TileInstanceData {
    pub terrain_land: Vec<TileTerrainLandInstance>,
    pub terrain_water: Vec<TileTerrainWaterInstance>,
    pub fog_of_war: Vec<TileFogOfWarInstance>,
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct TileTerrainLandInstance {
    pub position: [f32; 2],
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct TileTerrainWaterInstance {
    pub position: [f32; 2],
}


#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct TileFogOfWarInstance {
    pub position: [f32; 2],
    pub visibility: u8,
    pub _padding: [u8; 3],
}
