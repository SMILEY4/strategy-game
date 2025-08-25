use crate::js::models::{RouteNode, Settlement, TextureAtlasEntry, Tile, TilePosition, WorldObject};
use crate::renderer::app::RenderApp;
use crate::renderer::models::{FogTileVertex, LandTileVertex, MapDetailVertex, OverlayTileVertex, WaterTileVertex};
use js_sys::{Uint8Array};
use std::collections::HashMap;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

mod js;
mod renderer;
mod utils;

#[wasm_bindgen]
pub struct DirectRouteBuffer {
    pub ptr: *mut RouteNode,
    pub len: usize,
    pub item_size: usize,
}

#[wasm_bindgen]
pub struct DirectTileBuffer {
    pub ptr: *mut Tile,
    pub len: usize,
    pub item_size: usize,
}

#[wasm_bindgen]
pub struct DirectSettlementBuffer {
    pub ptr: *mut Settlement,
    pub len: usize,
    pub item_size: usize,
}

#[wasm_bindgen]
pub struct DirectWorldObjectBuffer {
    pub ptr: *mut WorldObject,
    pub len: usize,
    pub item_size: usize,
}

#[wasm_bindgen]
pub struct WasmRenderApp {
    app: RenderApp,
}

#[wasm_bindgen]
impl WasmRenderApp {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmRenderApp {
        console_error_panic_hook::set_once();
        WasmRenderApp {
            app: RenderApp::new(),
        }
    }

    pub fn set_texture_atlas_entries(&mut self, js_entries: JsValue) {
        let entries: HashMap<String, Vec<TextureAtlasEntry>> = serde_wasm_bindgen::from_value(js_entries).expect("valid js data");
        self.app.set_texture_atlas_entries(entries);
    }

    pub fn set_map_mode(&mut self, js_map_mode: JsValue) {
        let map_mode: String = serde_wasm_bindgen::from_value(js_map_mode).expect("valid js data");
        self.app.set_map_mode(map_mode);
    }

    pub fn set_relevant_world_area(&mut self, min_x: f32, min_y: f32, max_x: f32, max_y: f32) {
        self.app.set_relevant_world_area(min_x, min_y, max_x, max_y);
    }
    
    pub fn reserve_tiles_memory(&self, len: usize) -> DirectTileBuffer {
        let mut vec: Vec<Tile> = Vec::with_capacity(len);
        let ptr = vec.as_mut_ptr();
        std::mem::forget(vec);
        DirectTileBuffer {
            ptr: ptr,
            len: len,
            item_size: size_of::<Tile>(),
        }
    }

    pub fn upload_direct_tile_memory(&mut self, ptr: *mut Tile, len: usize) {
        unsafe {
            let tiles = Vec::from_raw_parts(ptr, len, len);
            self.app.set_tiles(tiles);
        }
    }

    pub fn reserve_settlement_memory(&self, len: usize) -> DirectSettlementBuffer {
        let mut vec: Vec<Settlement> = Vec::with_capacity(len);
        let ptr = vec.as_mut_ptr();
        std::mem::forget(vec);
        DirectSettlementBuffer {
            ptr: ptr,
            len: len,
            item_size: size_of::<Settlement>(),
        }
    }

    pub fn upload_direct_settlement_memory(&mut self, ptr: *mut Settlement, len: usize) {
        unsafe {
            let settlements = Vec::from_raw_parts(ptr, len, len);
            self.app.set_settlements(settlements);
        }
    }

    pub fn reserve_world_object_memory(&self, len: usize) -> DirectWorldObjectBuffer {
        let mut vec: Vec<WorldObject> = Vec::with_capacity(len);
        let ptr = vec.as_mut_ptr();
        std::mem::forget(vec);
        DirectWorldObjectBuffer {
            ptr: ptr,
            len: len,
            item_size: size_of::<WorldObject>(),
        }
    }

    pub fn upload_direct_world_object_memory(&mut self, ptr: *mut WorldObject, len: usize) {
        unsafe {
            let world_objects = Vec::from_raw_parts(ptr, len, len);
            self.app.set_world_objects(world_objects);
        }
    }


    pub fn reserve_route_memory(&self, len: usize) -> DirectRouteBuffer {
        let mut vec: Vec<RouteNode> = Vec::with_capacity(len);
        let ptr = vec.as_mut_ptr();
        std::mem::forget(vec);
        DirectRouteBuffer {
            ptr: ptr,
            len: len,
            item_size: size_of::<RouteNode>(),
        }
    }

    pub fn upload_direct_route_memory(&mut self, ptr: *mut RouteNode, len: usize) {
        unsafe {
            let route_nodes = Vec::from_raw_parts(ptr, len, len);

            let mut groups: HashMap<i32, Vec<RouteNode>> = HashMap::new();
            for node in route_nodes {
                let route_id = node.route_id;
                groups.entry(route_id).or_insert_with(Vec::new).push(node);
            }

            self.app.set_routes(groups.into_values().collect());
        }
    }

    pub fn set_move_targets(&mut self, js_move_targets: JsValue) {
        let move_targets: Vec<TilePosition> =
            serde_wasm_bindgen::from_value(js_move_targets).expect("valid js data");
        self.app.set_move_targets(move_targets)
    }

    pub fn update_borders(&mut self) {
        self.app.update_border_data()
    }

    pub fn update_terrain_tile_vertices(&mut self) {
        self.app.update_terrain_tile_vertices()
    }

    pub fn update_overlay_vertices(&mut self) {
        self.app.update_overlay_tile_vertices()
    }

    pub fn update_detail_vertices(&mut self) {
        self.app.update_detail_vertices()
    }

    pub fn get_vertex_buffer_water(&self) -> Uint8Array {
        let vertices = self.app.get_vertex_buffer_water();
        self.as_js_vertex_buffer::<WaterTileVertex>(vertices)
    }

    pub fn get_vertex_buffer_land(&self) -> Uint8Array {
        let vertices = self.app.get_vertex_buffer_land();
        self.as_js_vertex_buffer::<LandTileVertex>(vertices)
    }

    pub fn get_vertex_buffer_fog(&self) -> Uint8Array {
        let vertices = self.app.get_vertex_buffer_fog();
        self.as_js_vertex_buffer::<FogTileVertex>(vertices)
    }

    pub fn get_vertex_buffer_overlay(&self) -> Uint8Array {
        let vertices = self.app.get_vertex_buffer_overlay();
        self.as_js_vertex_buffer::<OverlayTileVertex>(vertices)
    }

    pub fn get_vertex_buffer_detail(&self) -> Uint8Array {
        let vertices = self.app.get_vertex_buffer_detail();
        self.as_js_vertex_buffer::<MapDetailVertex>(vertices)
    }

    pub fn get_vertex_count_detail(&self) -> usize {
        self.app.get_vertex_buffer_detail().len()
    }

    fn as_js_vertex_buffer<T>(&self, vertices: &Vec<T>) -> Uint8Array {
        let byte_len = vertices.len() * size_of::<T>();
        let ptr = vertices.as_ptr() as *const u8;
        unsafe { Uint8Array::view(std::slice::from_raw_parts(ptr, byte_len)) }
    }
}
