mod js;
mod render;
mod math;

use js_sys::Uint8Array;
use crate::js::direct_buffer::DirectBuffer;
use crate::js::models::Tile;
use crate::render::renderer::Renderer;
use js::direct_buffer::DirectMemoryHandle;
use wasm_bindgen::prelude::wasm_bindgen;
use crate::js::{direct_buffer};

#[wasm_bindgen]
pub struct WasmRenderApp {
    renderer: Renderer,
}

#[wasm_bindgen]
impl WasmRenderApp {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmRenderApp {
        console_error_panic_hook::set_once();
        WasmRenderApp {
            renderer: Renderer::new(),
        }
    }

    pub fn tiles_reserve_memory(&self, len: usize) -> DirectMemoryHandle {
        DirectBuffer::reserve::<Tile>(len)
    }

    pub fn tiles_upload(&mut self, ptr: usize, len: usize) {
        let tiles = unsafe { DirectBuffer::upload::<Tile>(ptr, len) };
        self.renderer.set_tiles(tiles)
    }

    pub fn calculate_all_chunks(&mut self) -> bool {
        self.renderer.calculate_all_chunks()
    }

    pub fn calculate_visible_chunks(&mut self) -> bool {
        self.renderer.calculate_visible_chunks()
    }

    pub fn calculate_terrain_tile_instances(&mut self) -> bool {
        self.renderer.calculate_terrain_tile_instances();
        true
    }

    pub fn get_terrain_tile_land_instances(&self) -> Uint8Array {
        direct_buffer::as_js_buffer(self.renderer.get_terrain_tile_instances_land())
    }

    pub fn get_terrain_tile_land_instance_count(&self) -> usize {
        self.renderer.get_terrain_tile_instances_land().len()
    }

    pub fn get_terrain_tile_water_instances(&self) -> Uint8Array {
        direct_buffer::as_js_buffer(self.renderer.get_terrain_tile_instances_water())
    }

    pub fn get_terrain_tile_water_instance_count(&self) -> usize {
        self.renderer.get_terrain_tile_instances_water().len()
    }

}
