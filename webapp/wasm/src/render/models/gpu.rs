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

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct GridOverlayInstance {
    pub position: [f32; 2],
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct GenericFillOverlayInstance {
    // instance of a hex-mesh filling in a complete tile
    pub position: [f32; 2], // hex position (q,r)
    pub color: [f32; 4],    //  color as rgba
    pub style: u32,         // fill style: 0 = solid, 1 = striped
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct GenericEdgeOverlayInstance {
    // instance of a triangle mesh with one vertex anchored to the hex center and the other vertices defining the edge.
    pub position: [f32; 2], // hex position (q,r)
    pub direction: u32, // the direction the edge/triangle is pointing (i.e. cw rotation, top-right = 0, right = 1, top-left = 7)
    pub color: [f32; 4], // color as rgba
    pub style: u32,     // edge style: 0 = solid, 1 = dashed
}

pub const OVERLAY_EDGE_STYLE_FILLED: u32 = 0;
pub const OVERLAY_EDGE_STYLE_DASHED: u32 = 1;

pub const OVERLAY_FILL_STYLE_FILLED: u32 = 0;
pub const OVERLAY_FILL_STYLE_STRIPED: u32 = 1;
