use crate::api::Tile;
use js_sys::Uint8Array;
use std::cell::RefCell;
use std::collections::HashMap;
use js_sys::Math::{max, min};

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct LandTileVertex {
    position: [f32; 2],
    color: [f32; 3],
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct WaterTileVertex {
    position: [f32; 2],
    depth: f32,
    border_mask: i32,
}

#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct FogTileVertex {
    position: [f32; 2],
    visibility: i32,
}

#[derive(Default)]
struct VertexData {
    land: Vec<LandTileVertex>,
    water: Vec<WaterTileVertex>,
    fog: Vec<FogTileVertex>,
}

#[derive(Default)]
struct TileData {
    tiles: Vec<Tile>,
    coastline: HashMap<String, i32>
}

thread_local! {
    static TILES: RefCell<TileData> = RefCell::new(TileData::default());
    static VERTEX_DATA: RefCell<VertexData> = RefCell::new(VertexData::default());
}


pub fn set_tiles(tiles: Vec<Tile>) {
    TILES.with(|d| {
        d.borrow_mut().tiles = tiles;
    });
}

pub fn update_vertex_data() {

    let color_land_light: [f32; 3] = [148.0/255.0, 155.0/255.0, 100.0/255.0];
    let color_land_dark: [f32; 3] = [116.0/255.0, 126.0/255.0, 87.0/255.0];

    TILES.with(|data_tiles| {
        let tile_data = data_tiles.borrow();
        let tiles = &tile_data.tiles;

        VERTEX_DATA.with(|data| {
            let mut vertex_data = data.borrow_mut();

            vertex_data.land.clear();
            vertex_data.water.clear();
            vertex_data.fog.clear();

            for tile in tiles.iter() {

                // land
                if tile.terrain_type == 1 {
                    let height_jitter = tile.random_1 * 0.1 - 0.5;
                    let height = tile.height * 2.0 + height_jitter;
                    vertex_data.land.push(LandTileVertex {
                        position: [tile.world_position.x, tile.world_position.y],
                        color: mix(&color_land_light, &color_land_dark, height),
                    });
                }

                // water
                if tile.terrain_type == 2 {
                    let height_jitter = tile.random_1 * 0.1 - 0.5;
                    vertex_data.water.push(WaterTileVertex {
                        position: [tile.world_position.x, tile.world_position.y],
                        depth: 1.0 - clamp(0.0, 1.0, (tile.height + 1.0) * 2.0 + height_jitter),
                        border_mask: 0,
                    });
                }

                // fog
                if tile.visibility != 2 {
                    vertex_data.fog.push(FogTileVertex {
                        position: [tile.world_position.x, tile.world_position.y],
                        visibility: tile.visibility as i32,
                    });
                }
            }
        })
    });
}

pub fn get_vertex_buffer_land() -> Uint8Array {
    VERTEX_DATA.with(|vertex_data| {
        let vertices = vertex_data.borrow();
        let byte_len = vertices.land.len() * size_of::<LandTileVertex>();
        let ptr = vertices.land.as_ptr() as *const u8;
        unsafe { Uint8Array::view(std::slice::from_raw_parts(ptr, byte_len)) }
    })
}

pub fn get_vertex_buffer_water() -> Uint8Array {
    VERTEX_DATA.with(|vertex_data| {
        let vertices = vertex_data.borrow();
        let byte_len = vertices.water.len() * size_of::<WaterTileVertex>();
        let ptr = vertices.water.as_ptr() as *const u8;
        unsafe { Uint8Array::view(std::slice::from_raw_parts(ptr, byte_len)) }
    })
}

pub fn get_vertex_buffer_fog() -> Uint8Array {
    VERTEX_DATA.with(|vertex_data| {
        let vertices = vertex_data.borrow();
        let byte_len = vertices.fog.len() * size_of::<FogTileVertex>();
        let ptr = vertices.fog.as_ptr() as *const u8;
        unsafe { Uint8Array::view(std::slice::from_raw_parts(ptr, byte_len)) }
    })
}

fn mix(x: &[f32; 3], y: &[f32; 3], a: f32) -> [f32; 3] {
    let clamped_a = clamp(0.0, 1.0, a);
    [
        x[0] * (1.0 - clamped_a) + y[0] * clamped_a,
        x[1] * (1.0 - clamped_a) + y[1] * clamped_a,
        x[2] * (1.0 - clamped_a) + y[2] * clamped_a,
    ]
}

fn clamp(x_min: f32, x_max: f32, x: f32) -> f32 {
    max(x_min as f64, min(x as f64, x_max as f64)) as f32
}