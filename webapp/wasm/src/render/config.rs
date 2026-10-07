use std::collections::HashMap;
use crate::js::models::SpriteSheetEntry;
use crate::render::models::sprite_sheet::MapDetailSpriteGroupConfig;

pub struct Config {
    pub spritesheet_entries: HashMap<i32, Vec<SpriteSheetEntry>>,
    pub routes: RouteConfig,
    pub overlays: OverlayConfig,
    pub map_details: MapDetailsConfig,
}

pub struct RouteConfig {
    pub width: f32,
    pub highlight_width: f32,
    pub subdivisions_per_segment: usize,
}

pub struct OverlayConfig {
    pub political_fill_alpha: f32,
    pub political_edge_alpha: f32,
    pub political_edge_thickness: f32,
    pub entity_control_color: [f32; 4],
    pub entity_control_entity_thickness: f32,
    pub entity_control_settlement_thickness: f32,
    pub settlement_location_color: [f32; 4],
}

pub struct MapDetailsConfig {
    pub mountains: MapDetailSpriteGroupConfig,
    pub hills: MapDetailSpriteGroupConfig,
    pub trees: MapDetailSpriteGroupConfig,
    pub buildings: MapDetailSpriteGroupConfig,
    pub tile_improvement: MapDetailSpriteGroupConfig,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            spritesheet_entries: HashMap::new(),
            routes: RouteConfig {
                width: 0.2,
                highlight_width: 0.3,
                subdivisions_per_segment: 8,
            },
            overlays: OverlayConfig {
                political_fill_alpha: 0.35,
                political_edge_alpha: 1.0,
                political_edge_thickness: 0.1,
                entity_control_color: [1.0, 1.0, 1.0, 1.0],
                entity_control_entity_thickness: 0.05,
                entity_control_settlement_thickness: 0.1,
                settlement_location_color: [0.2, 0.6, 0.25, 0.35],
            },
            map_details: MapDetailsConfig {
                mountains: MapDetailSpriteGroupConfig {
                    atlas_id: 1,
                    amount: [2, 3],
                    radius: 0.7,
                    distribution: 1.0,
                    squish: 0.5,
                    push: -0.4,
                },
                hills: MapDetailSpriteGroupConfig {
                    atlas_id: 2,
                    amount: [2, 3],
                    radius: 0.7,
                    distribution: 1.0,
                    squish: 0.6,
                    push: -0.4,
                },
                trees: MapDetailSpriteGroupConfig {
                    atlas_id: 3,
                    amount: [10, 20],
                    radius: 0.9,
                    distribution: 1.0,
                    squish: 0.9,
                    push: -0.1,
                },
                buildings: MapDetailSpriteGroupConfig {
                    atlas_id: 4,
                    amount: [7, 10],
                    radius: 0.7,
                    distribution: 0.7,
                    squish: 0.9,
                    push: -0.1,
                },
                tile_improvement: MapDetailSpriteGroupConfig {
                    atlas_id: 5,
                    amount: [1, 1],
                    radius: 0.2,
                    distribution: 0.7,
                    squish: 0.2,
                    push: -0.6,
                },
            },
        }
    }
}
