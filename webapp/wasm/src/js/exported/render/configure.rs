use crate::js::models::SpriteSheetEntry;
use super::WasmRenderApp;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
impl WasmRenderApp {
    pub fn add_spritesheet_entries(&mut self, group_id: u8, entries: Vec<SpriteSheetEntry>) {
        self.renderer.set_spritesheet_entries(group_id, entries);
    }
}
