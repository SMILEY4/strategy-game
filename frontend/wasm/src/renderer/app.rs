use crate::js::models::{MapMode, Tile, TilePosition};
use crate::renderer::border;
use crate::renderer::models::{FogTileVertex, LandTileVertex, OverlayTileVertex, WaterTileVertex};
use crate::renderer::state::RenderState;
use crate::utils::math::mix;
use std::collections::HashSet;
use std::iter::FromIterator;

pub struct RenderApp {
    state: RenderState,
}

impl RenderApp {
    pub fn new() -> RenderApp {
        RenderApp {
            state: RenderState::default(),
        }
    }

    pub fn set_map_mode(&mut self, map_mode: String) {
        self.state.map_mode = map_mode;
    }

    pub fn set_tiles(&mut self, tiles: Vec<Tile>) {
        self.state.tiles = tiles;
    }

    pub fn set_move_targets(&mut self, targets: Vec<TilePosition>) {
        self.state.move_targets = HashSet::from_iter(targets);
    }

    pub fn update_border_data(&mut self) {
        self.state.borders = border::build_tile_borders(&self.state.tiles)
    }

    pub fn update_terrain_tile_vertices(&mut self) {
        let color_land_light: [f32; 3] = [148.0 / 255.0, 155.0 / 255.0, 100.0 / 255.0];
        let color_land_dark: [f32; 3] = [116.0 / 255.0, 126.0 / 255.0, 87.0 / 255.0];

        // todo: possible optimization: count instances before and init vecs with correct capacity
        let vertex_data = &mut self.state.vertex_data;
        vertex_data.land.clear();
        vertex_data.water.clear();
        vertex_data.fog.clear();

        for (index, tile) in self.state.tiles.iter().enumerate() {
            let border = &self.state.borders[index];

            // land
            if tile.terrain_type == 1 {
                let height_jitter = tile.random_1 * 0.1 - 0.5;
                let height = tile.height * 2.0 + height_jitter;
                vertex_data.land.push(LandTileVertex {
                    position: [tile.world_position.x, tile.world_position.y],
                    color: mix(&color_land_light, &color_land_dark, height),
                });
            }

            // water
            if tile.terrain_type == 2 {
                let height_jitter = tile.random_1 * 0.1 - 0.5;
                vertex_data.water.push(WaterTileVertex {
                    position: [tile.world_position.x, tile.world_position.y],
                    depth: 1.0 - ((tile.height + 1.0) * 2.0 + height_jitter).clamp(0.0, 1.0),
                    border_mask: border::pack(&border.coast) as u32,
                });
            }

            // fog
            if tile.visibility != 2 {
                vertex_data.fog.push(FogTileVertex {
                    position: [tile.world_position.x, tile.world_position.y],
                    visibility: tile.visibility as i32,
                });
            }
        }
    }

    pub fn update_overlay_tile_vertices(&mut self) {
        // todo: possible optimization: count instances before and init vecs with correct capacity
        let vertex_data = &mut self.state.vertex_data;
        vertex_data.overlay.clear();

        let map_mode_data: MapMode = match self.state.map_mode.as_str() {
            "default" => MapMode::DEFAULT,
            "countries" => MapMode::COUNTRIES,
            "settlements" => MapMode::SETTLEMENTS,
            "settlement_locations" => MapMode::SETTLEMENT_LOCATIONS,
            "resources" => MapMode::RESOURCES,
            "terrain" => MapMode::TERRAIN,
            _ => MapMode::DEFAULT
        };

        
        for (index, tile) in self.state.tiles.iter().enumerate() {
            let border = &self.state.borders[index];

            if tile.visibility != 2 {
                vertex_data.overlay.push(OverlayTileVertex {
                    position: [tile.world_position.x, tile.world_position.y],
                    tile_position: [tile.position.q, tile.position.r],
                    primary_border_mask: border::pack((map_mode_data.border_provider)(border)) as u32,
                    primary_border_color: (map_mode_data.border_color)(tile),
                    primary_fill_color: (map_mode_data.fill_color)(tile),
                    highlight_border_mask: 0,
                    highlight_border_color: [0.0, 0.0, 0.0, 0.0],
                    highlight_fill_color: if (self.state.move_targets.contains(&tile.position)) {
                        [0.941, 0.921, 0.686, 0.5]
                    } else {
                        [0.0, 0.0, 0.0, 0.0]
                    },
                });
            }
        }
    }

    pub fn get_vertex_buffer_water(&self) -> &Vec<WaterTileVertex> {
        &self.state.vertex_data.water
    }

    pub fn get_vertex_buffer_land(&self) -> &Vec<LandTileVertex> {
        &self.state.vertex_data.land
    }

    pub fn get_vertex_buffer_fog(&self) -> &Vec<FogTileVertex> {
        &self.state.vertex_data.fog
    }

    pub fn get_vertex_buffer_overlay(&self) -> &Vec<OverlayTileVertex> {
        &self.state.vertex_data.overlay
    }
}
