#[derive(Default)]
pub struct TileInstanceData {
    pub terrain_land: Vec<TileTerrainLandInstance>,
    pub terrain_water: Vec<TileTerrainWaterInstance>,
    pub fog_of_war: Vec<TileFogOfWarInstance>,
}

#[derive(Default)]
pub struct MapDetailsVertexData {
    pub map_detail_vertices: Vec<MapDetailVertex>
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

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct MapDetailVertex {
    pub position: [f32; 2],
    pub vertex: [f32; 3],
    pub offset: [f32; 2],
    pub texture_coords: [f32; 2],
    pub atlas: u32,
    pub is_pending: u32,
}


#[derive(Default)]
pub struct OverlayVertexData {
    pub grid_instances: Vec<GridOverlayInstance>,
    pub fill_instances: Vec<GenericFillOverlayInstance>,
    pub edge_instances: Vec<GenericEdgeOverlayInstance>
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct GridOverlayInstance {
    pub position: [f32; 2],
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct GenericFillOverlayInstance {
    pub position: [f32; 2],
    pub color: [f32; 4],
    pub style: u32
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct GenericEdgeOverlayInstance {
    pub position: [f32; 2],
    pub direction: u32,
    pub color: [f32; 4],
    pub style: u32
}