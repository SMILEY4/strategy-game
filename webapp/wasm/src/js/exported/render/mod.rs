mod configure;
mod download;
mod operations;
mod upload;

use wasm_bindgen::prelude::wasm_bindgen;
use crate::render::Renderer;

#[wasm_bindgen]
pub struct WasmRenderApp {
    renderer: Renderer,
}

#[wasm_bindgen]
impl WasmRenderApp {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        console_error_panic_hook::set_once();
        let mut renderer = Renderer::new();
        renderer.initialize();
        Self { renderer }
    }
}
