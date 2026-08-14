use std::collections::HashMap;
use crate::js::models::SpriteSheetEntry;

#[derive(Default)]
pub struct RenderConfig {
    pub spritesheet_entries: HashMap<i32, Vec<SpriteSheetEntry>>,
}