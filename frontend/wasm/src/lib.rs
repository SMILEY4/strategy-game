mod utils;

use wasm_bindgen::prelude::*;
use js_sys::{ArrayBuffer, Uint8Array, Int32Array, Array};
use std::cell::RefCell;
use serde::Deserialize;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[derive(Deserialize, Clone)]
pub struct Tile {
    pub position: TilePosition,
}

#[derive(Deserialize, Clone)]
pub struct TilePosition {
    pub q: i32,
    pub r: i32,
}

thread_local! {
    static DATA: RefCell<Vec<Tile>> = RefCell::new(Vec::new());
}


#[wasm_bindgen]
pub fn init_tiles(js_data: JsValue) {
    let vec: Vec<Tile> = serde_wasm_bindgen::from_value(js_data).expect("Invalid JS data");
    DATA.with(|d| *d.borrow_mut() = vec);
}

#[wasm_bindgen]
pub fn compute() -> ArrayBuffer {
    DATA.with(|d| {
        let data = d.borrow();
        let mut buffer = Vec::with_capacity(data.len());

        for tile in data.iter() {
            buffer.push( tile.position.q as i32)
        }

        let array = Int32Array::from(buffer.as_slice());
        array.buffer()
    })
}
