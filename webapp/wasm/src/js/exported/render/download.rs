use super::WasmRenderApp;
use crate::js::direct_buffer;
use js_sys::Uint8Array;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
impl WasmRenderApp {
    pub fn get_terrain_tile_land_instances(&self) -> Uint8Array {
        direct_buffer::as_js_buffer(self.renderer.get_terrain_tile_instances_land())
    }

    pub fn get_terrain_tile_land_instances_count(&self) -> usize {
        self.renderer.get_terrain_tile_instances_land().len()
    }

    pub fn get_terrain_tile_water_instances(&self) -> Uint8Array {
        direct_buffer::as_js_buffer(self.renderer.get_terrain_tile_instances_water())
    }

    pub fn get_terrain_tile_water_instances_count(&self) -> usize {
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

    pub fn get_map_detail_vertices_count(&self) -> usize {
        self.renderer.get_map_detail_vertices().len()
    }

    pub fn get_overlay_grid_instances(&self) -> Uint8Array {
        direct_buffer::as_js_buffer(self.renderer.get_grid_instances())
    }

    pub fn get_overlay_grid_instances_count(&self) -> usize {
        self.renderer.get_grid_instances().len()
    }

    pub fn get_overlay_fill_instances(&self) -> Uint8Array {
        direct_buffer::as_js_buffer(self.renderer.get_overlay_fill_instances())
    }

    pub fn get_overlay_fill_instances_count(&self) -> usize {
        self.renderer.get_overlay_fill_instances().len()
    }

    pub fn get_overlay_edge_instances(&self) -> Uint8Array {
        direct_buffer::as_js_buffer(self.renderer.get_overlay_edge_instances())
    }

    pub fn get_overlay_edge_instances_count(&self) -> usize {
        self.renderer.get_overlay_edge_instances().len()
    }
}
