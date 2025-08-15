use js_sys::{ArrayBuffer, Int32Array};
use wasm_bindgen::JsValue;
use wasm_bindgen::prelude::wasm_bindgen;
use crate::api::Tile;
use crate::renderer;

#[wasm_bindgen]
struct RendererApi;

#[wasm_bindgen]
impl RendererApi {

    #[allow(dead_code)]
    pub fn init_tiles(js_data: JsValue) {
        let tiles: Vec<Tile> = serde_wasm_bindgen::from_value(js_data).expect("valid js data");
        renderer::init_tiles(tiles);
    }

    #[allow(dead_code)]
    pub fn compute() -> ArrayBuffer {
        let buffer = renderer::compute();
        let array = Int32Array::from(buffer.as_slice());
        array.buffer()
    }

}