use super::WasmRenderApp;
use crate::js::direct_buffer::{DirectBuffer, DirectMemoryHandle};
use crate::js::models::{Control, Entity, Tile};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
impl WasmRenderApp {
    pub fn reserve_tiles_memory(&self, len: usize) -> DirectMemoryHandle {
        DirectBuffer::reserve::<Tile>(len)
    }

    pub fn upload_tiles(&mut self, ptr: usize, len: usize) {
        let tiles = unsafe { DirectBuffer::upload::<Tile>(ptr, len) };
        self.renderer.set_tiles(tiles)
    }

    pub fn reserve_tile_control_values_memory(&self, len: usize) -> DirectMemoryHandle {
        DirectBuffer::reserve::<Control>(len)
    }

    pub fn upload_tile_control_values(&mut self, ptr: usize, len: usize) {
        let controls = unsafe { DirectBuffer::upload::<Control>(ptr, len) };
        self.renderer.set_tile_control_values(controls)
    }

    pub fn reserve_entities_memory(&self, len: usize) -> DirectMemoryHandle {
        DirectBuffer::reserve::<Entity>(len)
    }

    pub fn upload_entities(&mut self, ptr: usize, len: usize) {
        let entities = unsafe { DirectBuffer::upload::<Entity>(ptr, len) };
        self.renderer.set_entities(entities)
    }

    pub fn set_map_mode(&mut self, map_mode: u32) {
        self.renderer.set_map_mode(map_mode)
    }

    pub fn set_selected_entity_id(&mut self, entity_id: Option<u32>) {
        self.renderer.set_selected_entity_id(entity_id)
    }
}
