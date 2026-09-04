mod configure;
mod download;
mod operations;
mod upload;

use crate::render::renderer::Renderer;
use wasm_bindgen::prelude::wasm_bindgen;

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
