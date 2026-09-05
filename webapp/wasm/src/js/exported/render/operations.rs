use super::WasmRenderApp;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
impl WasmRenderApp {
    pub fn calculate_all_chunks(&mut self) -> bool {
        self.renderer.calculate_all_chunks()
    }

    pub fn calculate_visible_chunks(&mut self) -> bool {
        self.renderer.calculate_visible_chunks()
    }

    pub fn calculate_tile_instances(&mut self) -> bool {
        self.renderer.build_terrain_instances();
        self.renderer.build_map_details_instances();
        true
    }

    pub fn calculate_overlay_instances(&mut self) -> bool {
        self.renderer.build_overlay_instances();
        true
    }
}
