mod utils;

use wasm_bindgen::prelude::*;
use js_sys::{ArrayBuffer, Uint8Array, Array, Reflect};
use std::cell::RefCell;

thread_local! {
    static STORED_DATA: RefCell<Option<Array>> = RefCell::new(None);
}

#[wasm_bindgen]
extern "C" {
  #[wasm_bindgen(js_namespace = console)]
  fn log(s: &str);
}

#[wasm_bindgen]
pub fn init_tiles(data: JsValue) {
    let arr: Array = Array::from(&data);
    STORED_DATA.with(|slot| {
        *slot.borrow_mut() = Some(arr);
    });
}

#[wasm_bindgen]
pub fn compute() {
    STORED_DATA.with(|slot| {
        if let Some(arr) = &*slot.borrow() {
            calculate_tile_instances(arr);
        }
    });
}

fn calculate_tile_instances(arr: &Array) -> ArrayBuffer {
    let buffer = ArrayBuffer::new(arr.length());
    let view = Uint8Array::new(&buffer);

    for i in 0..arr.length() {
        let obj = arr.get(i);
        let position = Reflect::get(&obj, &JsValue::from_str("position")).unwrap_or(JsValue::NULL);
        let posQ = Reflect::get(&position, &JsValue::from_str("q")).unwrap_or(JsValue::NULL).as_f64().unwrap_or(0.0);
        let posR = Reflect::get(&position, &JsValue::from_str("r")).unwrap_or(JsValue::NULL).as_f64().unwrap_or(0.0);

        log(&format!("[wasm]: pos {}: {} {}", i, posQ, posR));
    }

    buffer
}
