use std::cell::RefCell;
use crate::api::{Tile};

thread_local! {
    static DATA: RefCell<Vec<Tile>> = RefCell::new(Vec::new());
}

pub fn init_tiles(tiles: Vec<Tile>) {
    DATA.with(|d| *d.borrow_mut() = tiles);
}

pub fn compute() -> Vec<i32> {
    DATA.with(|d| {
        let data = d.borrow();
        let mut buffer = Vec::with_capacity(data.len());

        for tile in data.iter() {
            buffer.push(tile.position.q)
        }

        return buffer;
    })
}
