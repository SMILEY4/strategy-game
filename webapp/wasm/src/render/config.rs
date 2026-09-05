use std::collections::HashMap;
use crate::js::models::SpriteSheetEntry;

#[derive(Default)]
pub struct Config {
    pub spritesheet_entries: HashMap<i32, Vec<SpriteSheetEntry>>,
}