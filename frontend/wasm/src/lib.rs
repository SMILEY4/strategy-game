use crate::js::models::{TextureAtlasEntry, Tile, TilePosition, WorldObject};
use crate::renderer::app::RenderApp;
use crate::renderer::models::{
    FogTileVertex, LandTileVertex, MapDetailVertex, OverlayTileVertex, WaterTileVertex,
};
use js_sys::Uint8Array;
use std::collections::HashMap;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

mod js;
mod renderer;
mod utils;

/// Handle for a shared buffer for tiles.
/// Allows javascript to write tiles directly to wasm memory without additional serialization.
#[wasm_bindgen]
pub struct DirectTileBuffer {
    pub ptr: *mut Tile,
    pub len: usize,
    pub item_size: usize,
}

/// Handle for a shared buffer for world objects.
/// Allows javascript to write world objects directly to wasm memory without additional serialization.
#[wasm_bindgen]
pub struct DirectWorldObjectBuffer {
    pub ptr: *mut WorldObject,
    pub len: usize,
    pub item_size: usize,
}

/// Public api for wasm rendering functions.
#[wasm_bindgen]
pub struct WasmRenderApp {
    app: RenderApp,
}

/// Public api for wasm rendering functions.
#[wasm_bindgen]
impl WasmRenderApp {
    /// Create a new instance of this api.
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmRenderApp {
        console_error_panic_hook::set_once();
        WasmRenderApp {
            app: RenderApp::new(),
        }
    }

    /// set/initialize the texture atlas.
    pub fn set_texture_atlas_entries(&mut self, js_entries: JsValue) {
        let entries: HashMap<String, Vec<TextureAtlasEntry>> =
            serde_wasm_bindgen::from_value(js_entries).expect("valid js data");
        self.app.set_texture_atlas_entries(entries);
    }

    /// Set the current map mode.
    /// This does not automatically trigger a re-calculation of anything else.
    pub fn set_map_mode(&mut self, js_map_mode: JsValue) {
        let map_mode: String = serde_wasm_bindgen::from_value(js_map_mode).expect("valid js data");
        self.app.set_map_mode(map_mode);
    }

    /// Set/Update the current relevant world area and re-calculate the relevant tiles.
    /// Steps may skip tiles that are not in these bounds.
    pub fn set_relevant_world_area(&mut self, min_x: f32, min_y: f32, max_x: f32, max_y: f32) {
        self.app.set_relevant_world_area(min_x, min_y, max_x, max_y);
        self.app.update_relevant_area();
    }

    /// Reserve memory for holding the given amount of tiles.
    /// JS can write tiles directly to this memory.
    /// This memory is not handled by rust and is only read and freed when calling the matching "upload" function.
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

    /// Read and take control of the shared memory for tiles again.
    pub fn upload_direct_tile_memory(&mut self, ptr: *mut Tile, len: usize) {
        unsafe {
            let tiles = Vec::from_raw_parts(ptr, len, len);
            self.app.set_tiles(tiles);
        }
    }

    /// Reserve memory for holding the given amount of world objects.
    /// JS can write world objects directly to this memory.
    /// This memory is not handled by rust and is only read and freed when calling the matching "upload" function.
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

    /// Read and take control of the shared memory for world objects again.
    pub fn upload_direct_world_object_memory(&mut self, ptr: *mut WorldObject, len: usize) {
        unsafe {
            let world_objects = Vec::from_raw_parts(ptr, len, len);
            self.app.set_world_objects(world_objects);
        }
    }

    /// Set/Update the current move targets.
    /// This does not automatically trigger a re-calculation of anything else.
    pub fn set_move_targets(&mut self, js_move_targets: JsValue) {
        let move_targets: Vec<TilePosition> =
            serde_wasm_bindgen::from_value(js_move_targets).expect("valid js data");
        self.app.set_move_targets(move_targets)
    }

    /// Re-calculate the border data for all relevant tiles.
    /// Data from this step is required for other steps (e.g. terrain tiles, overlay, ...)
    pub fn update_borders(&mut self) {
        self.app.update_border_data()
    }

    /// Re-calculate the vertex data for terrain tiles (land, water, fog).
    pub fn update_terrain_tile_vertices(&mut self) {
        self.app.update_terrain_tile_vertices()
    }

    /// Re-calculate the vertex data for overlay tiles.
    pub fn update_overlay_vertices(&mut self) {
        self.app.update_overlay_tile_vertices()
    }

    /// Re-calculate the vertex data for map details.
    pub fn update_detail_vertices(&mut self) {
        self.app.update_detail_vertices()
    }

    /// returns the current vertex data for water tiles as a javascript buffer directly referencing the wasm memory.
    pub fn get_vertex_buffer_water(&self) -> Uint8Array {
        let vertices = self.app.get_vertex_buffer_water();
        self.as_js_vertex_buffer::<WaterTileVertex>(vertices)
    }

    /// returns the number of vertices in the water tiles vertex data buffer.
    pub fn get_vertex_buffer_water_size(&self) -> usize {
        self.app.get_vertex_buffer_water().len()
    }

    /// returns the current vertex data for land tiles as a javascript buffer directly referencing the wasm memory.
    pub fn get_vertex_buffer_land(&self) -> Uint8Array {
        let vertices = self.app.get_vertex_buffer_land();
        self.as_js_vertex_buffer::<LandTileVertex>(vertices)
    }

    /// returns the number of vertices in the land tiles vertex data buffer.
    pub fn get_vertex_buffer_land_size(&self) -> usize {
        self.app.get_vertex_buffer_land().len()
    }

    /// returns the current vertex data for fog tiles as a javascript buffer directly referencing the wasm memory.
    pub fn get_vertex_buffer_fog(&self) -> Uint8Array {
        let vertices = self.app.get_vertex_buffer_fog();
        self.as_js_vertex_buffer::<FogTileVertex>(vertices)
    }

    /// returns the number of vertices in the fog tiles vertex data buffer.
    pub fn get_vertex_buffer_fog_size(&self) -> usize {
        self.app.get_vertex_buffer_fog().len()
    }

    /// returns the current vertex data for overlay tiles as a javascript buffer directly referencing the wasm memory.
    pub fn get_vertex_buffer_overlay(&self) -> Uint8Array {
        let vertices = self.app.get_vertex_buffer_overlay();
        self.as_js_vertex_buffer::<OverlayTileVertex>(vertices)
    }

    /// returns the number of vertices in the overlay tiles vertex data buffer.
    pub fn get_vertex_buffer_overlay_size(&self) -> usize {
        self.app.get_vertex_buffer_overlay().len()
    }

    /// returns the current vertex data for map details as a javascript buffer directly referencing the wasm memory.
    pub fn get_vertex_buffer_detail(&self) -> Uint8Array {
        let vertices = self.app.get_vertex_buffer_detail();
        self.as_js_vertex_buffer::<MapDetailVertex>(vertices)
    }

    /// returns the number of vertices in the map details vertex data buffer.
    pub fn get_vertex_count_detail(&self) -> usize {
        self.app.get_vertex_buffer_detail().len()
    }

    fn as_js_vertex_buffer<T>(&self, vertices: &Vec<T>) -> Uint8Array {
        let byte_len = vertices.len() * size_of::<T>();
        let ptr = vertices.as_ptr() as *const u8;
        unsafe { Uint8Array::view(std::slice::from_raw_parts(ptr, byte_len)) }
    }
}
