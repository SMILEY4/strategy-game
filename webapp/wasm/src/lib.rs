mod js;
mod math;
mod render;

use crate::js::direct_buffer;
use crate::js::direct_buffer::DirectBuffer;
use crate::js::models::{Control, Entity, SpriteSheetEntry, Tile};
use crate::render::renderer::Renderer;
use js::direct_buffer::DirectMemoryHandle;
use js_sys::Uint8Array;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub struct WasmRenderApp {
    renderer: Renderer,
}

#[wasm_bindgen]
impl WasmRenderApp {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmRenderApp {
        console_error_panic_hook::set_once();
        let mut renderer = Renderer::new();
        renderer.initialize();
        WasmRenderApp { renderer }
    }

    pub fn add_spritesheet_entries(&mut self, group_id: u8, entries: Vec<SpriteSheetEntry>) {
        self.renderer.set_spritesheet_entries(group_id, entries);
    }

    pub fn tiles_reserve_memory(&self, len: usize) -> DirectMemoryHandle {
        DirectBuffer::reserve::<Tile>(len)
    }

    pub fn tiles_upload(&mut self, ptr: usize, len: usize) {
        let tiles = unsafe { DirectBuffer::upload::<Tile>(ptr, len) };
        self.renderer.set_tiles(tiles)
    }

    pub fn tile_control_values_reserve_memory(&self, len: usize) -> DirectMemoryHandle {
        DirectBuffer::reserve::<Control>(len)
    }

    pub fn tile_control_values_upload(&mut self, ptr: usize, len: usize) {
        let controls = unsafe { DirectBuffer::upload::<Control>(ptr, len) };
        self.renderer.set_tile_control_values(controls)
    }

    pub fn set_map_mode(&mut self, map_mode: u32) {
        self.renderer.set_map_mode(map_mode)
    }

    pub fn set_selected_settlement_id(&mut self, settlement_id: Option<u32>) {
        self.renderer.set_selected_settlement_id(settlement_id)
    }

    pub fn build_overlay_instances(&mut self) {
        self.renderer.build_overlay_instances()
    }

    pub fn entities_reserve_memory(&self, len: usize) -> DirectMemoryHandle {
        DirectBuffer::reserve::<Entity>(len)
    }

    pub fn entities_upload(&mut self, ptr: usize, len: usize) {
        let entities = unsafe { DirectBuffer::upload::<Entity>(ptr, len) };
        self.renderer.set_entities(entities)
    }

    pub fn calculate_all_chunks(&mut self) -> bool {
        self.renderer.calculate_all_chunks()
    }

    pub fn calculate_visible_chunks(&mut self) -> bool {
        self.renderer.calculate_visible_chunks()
    }

    pub fn calculate_terrain_tile_instances(&mut self) -> bool {
        self.renderer.calculate_instances();
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

    pub fn get_fog_of_war_tile_instances(&self) -> Uint8Array {
        direct_buffer::as_js_buffer(self.renderer.get_fog_of_war_tile_instances())
    }

    pub fn get_fog_of_war_tile_instances_count(&self) -> usize {
        self.renderer.get_fog_of_war_tile_instances().len()
    }

    pub fn get_map_detail_vertices(&self) -> Uint8Array {
        direct_buffer::as_js_buffer(self.renderer.get_map_detail_vertices())
    }

    pub fn get_map_detail_vertex_count(&self) -> usize {
        self.renderer.get_map_detail_vertices().len()
    }

    pub fn get_overlay_grid_instances(&self) -> Uint8Array {
        direct_buffer::as_js_buffer(self.renderer.get_grid_instances())
    }

    pub fn get_overlay_grid_instance_count(&self) -> usize {
        self.renderer.get_grid_instances().len()
    }

    pub fn get_overlay_fill_instances(&self) -> Uint8Array {
        direct_buffer::as_js_buffer(self.renderer.get_overlay_fill_instances())
    }

    pub fn get_overlay_fill_instance_count(&self) -> usize {
        self.renderer.get_overlay_fill_instances().len()
    }

    pub fn get_overlay_edge_instances(&self) -> Uint8Array {
        direct_buffer::as_js_buffer(self.renderer.get_overlay_edge_instances())
    }

    pub fn get_overlay_edge_instance_count(&self) -> usize {
        self.renderer.get_overlay_edge_instances().len()
    }
}
