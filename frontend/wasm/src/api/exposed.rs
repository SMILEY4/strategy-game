use crate::api::Tile;
use crate::renderer;
use js_sys::Uint8Array;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

#[wasm_bindgen]
struct RendererApi;

#[wasm_bindgen]
impl RendererApi {
    
    #[allow(dead_code)]
    pub fn init_tiles(js_tiles: JsValue) {
        let tiles: Vec<Tile> = serde_wasm_bindgen::from_value(js_tiles).expect("valid js data");
        renderer::set_tiles(tiles);
    }

    #[allow(dead_code)]
    pub fn update() {
        renderer::update_vertex_data();
    }

    #[allow(dead_code)]
    pub fn get_vertices_land() -> Uint8Array {
        renderer::get_vertex_buffer_land()
    }

    #[allow(dead_code)]
    pub fn get_vertices_water() -> Uint8Array {
        renderer::get_vertex_buffer_water()
    }

    #[allow(dead_code)]
    pub fn get_vertices_fog() -> Uint8Array {
        renderer::get_vertex_buffer_fog()
    }
}
