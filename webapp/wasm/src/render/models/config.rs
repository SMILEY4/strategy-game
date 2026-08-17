use std::collections::HashMap;
use crate::js::models::SpriteSheetEntry;

#[derive(Default)]
pub struct RenderConfig {
    pub spritesheet_entries: HashMap<i32, Vec<SpriteSheetEntry>>,
}

pub struct MapDetailSpriteGroupConfig {
    pub atlas_id: i32,
    pub amount: [usize; 2],
    pub radius: f32,
    pub distribution: f32,
    pub squish: f32,
    pub push: f32,
}

pub const SPRITE_GROUP_CONFIG_MOUNTAINS: MapDetailSpriteGroupConfig = MapDetailSpriteGroupConfig {
    atlas_id: 1,
    amount: [2, 3],
    radius: 0.7,
    distribution: 1.0,
    squish: 0.5,
    push: -0.4,
};

pub const SPRITE_GROUP_CONFIG_HILLS: MapDetailSpriteGroupConfig = MapDetailSpriteGroupConfig {
    atlas_id: 2,
    amount: [2, 3],
    radius: 0.7,
    distribution: 1.0,
    squish: 0.6,
    push: -0.4,
};

pub const SPRITE_GROUP_CONFIG_TREES: MapDetailSpriteGroupConfig = MapDetailSpriteGroupConfig {
    atlas_id: 3,
    amount: [10, 20],
    radius: 0.9,
    distribution: 1.0,
    squish: 0.9,
    push: -0.1,
};

pub const SPRITE_GROUP_CONFIG_BUILDINGS: MapDetailSpriteGroupConfig = MapDetailSpriteGroupConfig {
    atlas_id: 4,
    amount: [7, 10],
    radius: 0.7,
    distribution: 0.7,
    squish: 0.9,
    push: -0.1,
};