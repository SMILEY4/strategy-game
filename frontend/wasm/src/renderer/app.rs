use crate::js::models::{MapMode, TextureAtlasEntry, Tile, TilePosition};
use crate::renderer::border;
use crate::renderer::models::{
    FogTileVertex, LandTileVertex, MapDetailVertex, OverlayTileVertex, WaterTileVertex,
};
use crate::renderer::state::RenderState;
use crate::utils::math::mix;
use std::collections::{HashMap, HashSet};
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

    pub fn set_texture_atlas_entries(&mut self, entries: HashMap<String, Vec<TextureAtlasEntry>>) {
       self.state.texture_atlas_entries = entries;
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
                    position: [tile.world_x, tile.world_y],
                    color: mix(&color_land_light, &color_land_dark, height),
                });
            }

            // water
            if tile.terrain_type == 2 {
                let height_jitter = tile.random_1 * 0.1 - 0.5;
                vertex_data.water.push(WaterTileVertex {
                    position: [tile.world_x, tile.world_y],
                    depth: 1.0 - ((tile.height + 1.0) * 2.0 + height_jitter).clamp(0.0, 1.0),
                    border_mask: border::pack(&border.coast) as u32,
                });
            }

            // fog
            if tile.visibility != 2 {
                vertex_data.fog.push(FogTileVertex {
                    position: [tile.world_x, tile.world_y],
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
            _ => MapMode::DEFAULT,
        };

        for (index, tile) in self.state.tiles.iter().enumerate() {
            let border = &self.state.borders[index];

            if tile.visibility != 2 {
                let position = TilePosition {
                    q: tile.position_q,
                    r: tile.position_r,
                };
                vertex_data.overlay.push(OverlayTileVertex {
                    position: [tile.world_x, tile.world_y],
                    tile_position: [tile.position_q, tile.position_r],
                    primary_border_mask: border::pack((map_mode_data.border_provider)(border))
                        as u32,
                    primary_border_color: (map_mode_data.border_color)(tile),
                    primary_fill_color: (map_mode_data.fill_color)(tile),
                    highlight_border_mask: 0,
                    highlight_border_color: [0.0, 0.0, 0.0, 0.0],
                    highlight_fill_color: if (self.state.move_targets.contains(&position)) {
                        [0.941, 0.921, 0.686, 0.5]
                    } else {
                        [0.0, 0.0, 0.0, 0.0]
                    },
                });
            }
        }
    }

    pub fn update_detail_vertices(&mut self) {
        let color_land_light: [f32; 3] = [148.0 / 255.0, 155.0 / 255.0, 100.0 / 255.0];
        let color_land_dark: [f32; 3] = [116.0 / 255.0, 126.0 / 255.0, 87.0 / 255.0];
        let terrain_names = vec!["mountain", "hill", "forest", "none"];

        let vertex_data = &mut self.state.vertex_data;
        vertex_data.map_detail.clear();

        let atlas_entries_mountain = &self.state.texture_atlas_entries["terrain_mountain"];
        let atlas_entries_hill = &self.state.texture_atlas_entries["terrain_hill"];
        let atlas_entries_forest = &self.state.texture_atlas_entries["terrain_forest"];

        for tile in self.state.tiles.iter() {
            if tile.visibility == 2 {
                continue;
            }
            if tile.terrain_type != 1 {
                continue;
            }

            let terrain = terrain_names[(tile.random_0 * terrain_names.len() as f32) as usize].to_string();

            match terrain.as_str() {
                "mountain" => {
                    vertex_data.map_detail.extend(Self::add_sprite(
                        &atlas_entries_mountain[(tile.random_1 * atlas_entries_mountain.len() as f32) as usize],
                        (
                            tile.world_x,
                            tile.world_y
                        ),
                        (
                            tile.world_y - 3.5,
                            tile.world_y + 3.5
                        ),
                        (
                            22.0,
                            16.0
                        ),
                        color_land_light,
                        [0.0, 0.0, 0.0],
                    ));
                }
                "hill" => {
                    vertex_data.map_detail.extend(Self::add_sprite(
                        &atlas_entries_hill[(tile.random_1 * atlas_entries_hill.len() as f32) as usize],
                        (
                            tile.world_x,
                            tile.world_y
                        ),
                        (
                            tile.world_y - 3.5,
                            tile.world_y + 3.5
                        ),
                        (
                            22.0,
                            16.0
                        ),
                        color_land_light,
                        [0.0, 0.0, 0.0],
                    ));
                }
                "forest" => {
                    vertex_data.map_detail.extend(Self::add_sprite(
                        &atlas_entries_forest[(tile.random_1 * atlas_entries_forest.len() as f32) as usize],
                        (
                            tile.world_x,
                            tile.world_y
                        ),
                        (
                            tile.world_y - 3.5,
                            tile.world_y + 3.5
                        ),
                        (
                            22.0,
                            16.0
                        ),
                        color_land_light,
                        [0.0, 0.0, 0.0],
                    ));
                }
                "none" | _ => {
                    // add none
                }
            }
        }
    }

    fn add_sprite(
        atlas_entry: &TextureAtlasEntry,
        pos: (f32, f32),
        sprite_z: (f32, f32),
        sprite_scale: (f32, f32),
        color_base: [f32; 3],
        color_country: [f32; 3],
    ) -> Vec<MapDetailVertex> {
        let mut vertices = Vec::new();

        let scale = (
            sprite_scale.0 * atlas_entry.scale,
            sprite_scale.1 * atlas_entry.scale,
        );

        for (index, vertex) in atlas_entry.vertices.chunks_exact(2).enumerate() {
            let x = pos.0 + vertex[0] * scale.0 - scale.0 / 2.0;
            let y = pos.1 + vertex[1] * scale.1;
            let z = sprite_z.0 + (sprite_z.1 - sprite_z.0) * vertex[1];

            vertices.push(MapDetailVertex {
                position: [x, y, z],
                texture_coordinates: [
                    atlas_entry.texture_coordinates[index * 2 + 0],
                    atlas_entry.texture_coordinates[index * 2 + 1],
                ],
                base_color: color_base,
                country_color: color_country,
            })
        }

        vertices
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

    pub fn get_vertex_buffer_detail(&self) -> &Vec<MapDetailVertex> {
        &self.state.vertex_data.map_detail
    }
}
