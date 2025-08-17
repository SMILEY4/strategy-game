use crate::js::models::{TextureAtlasEntry, Tile, TilePosition};
use crate::renderer::app::RenderApp;
use crate::renderer::models::{FogTileVertex, LandTileVertex, MapDetailVertex, OverlayTileVertex, WaterTileVertex};
use js_sys::Uint8Array;
use std::collections::HashMap;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

mod js;
mod renderer;
mod utils;

#[wasm_bindgen]
pub struct DirectBuffer {
    pub ptr: *mut Tile,
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

    pub fn reserve_tiles_memory(&self, len: usize) -> DirectBuffer {
        let mut vec = Vec::with_capacity(len);
        let ptr = vec.as_mut_ptr();
        std::mem::forget(vec);
        DirectBuffer {
            ptr: ptr,
            len: len,
            item_size: size_of::<Tile>(),
        }
    }

    pub fn upload_direct_tile_memory(&mut self, ptr: *mut Tile, len: usize) {
        unsafe {
            let tiles = Vec::from_raw_parts(ptr, len, len);
            self.app.set_tiles(tiles)
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
