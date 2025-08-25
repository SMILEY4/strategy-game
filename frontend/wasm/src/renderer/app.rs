use crate::js::models::{
    MapMode, RouteNode, Settlement, TextureAtlasEntry, Tile, TilePosition, WorldObject,
};
use crate::renderer::border;
use crate::renderer::line_mesh::{
    build_line_mesh, cap_butt_end, cap_butt_start, join_miter, LineMeshConfig,
};
use crate::renderer::models::{
    FogTileVertex, LandTileVertex, MapDetailVertex, OverlayTileVertex, VertexData, WaterTileVertex,
};
use crate::renderer::state::RenderState;
use crate::utils::math::{mix, Random};
use crate::utils::{interpolate_curve, triangle_wave, Rect2d, Vec2d};
use std::collections::{HashMap, HashSet};
use std::iter::FromIterator;
use crate::js::imported::console_log;

pub struct RenderApp {
    state: RenderState,
    vertex_data: VertexData,
}

impl RenderApp {
    pub fn new() -> RenderApp {
        RenderApp {
            state: RenderState::default(),
            vertex_data: VertexData::default(),
        }
    }

    pub fn set_texture_atlas_entries(&mut self, entries: HashMap<String, Vec<TextureAtlasEntry>>) {
        self.state.texture_atlas_entries = entries;
    }

    pub fn set_map_mode(&mut self, map_mode: String) {
        self.state.map_mode = map_mode;
    }

    pub fn set_routes(&mut self, routes: Vec<Vec<RouteNode>>) {
        self.state.routes = routes;
    }

    pub fn set_tiles(&mut self, tiles: Vec<Tile>) {
        self.state.tiles = tiles;
        self.update_relevant_area();
    }

    pub fn set_settlements(&mut self, settlements: Vec<Settlement>) {
        self.state.settlements = settlements;
    }

    pub fn set_world_objects(&mut self, world_objects: Vec<WorldObject>) {
        self.state.world_objects = world_objects;
    }

    pub fn set_move_targets(&mut self, targets: Vec<TilePosition>) {
        self.state.move_targets = HashSet::from_iter(targets);
    }

    pub fn update_border_data(&mut self) {
        self.state.borders = border::build_tile_borders(&self.state.tiles)
    }

    pub fn set_relevant_world_area(&mut self, min_x: f32, min_y: f32, max_x: f32, max_y: f32) {
        let area = Rect2d {
            min_x: min_x,
            min_y: min_y,
            max_x: max_x,
            max_y: max_y,
        };
        console_log(format!("[WASM] relevant area {}, {}, {}, {}", min_x, min_y, max_x, max_y).as_str());
        self.state.relevant_world_area = area;
        self.update_relevant_area();
    }

    fn update_relevant_area(&mut self) {
        self.state.relevant_tile_indices.clear();
        for (index, tile) in self.state.tiles.iter().enumerate() {
            if self.state.relevant_world_area.contains_point(tile.world_x, tile.world_y) {
                self.state.relevant_tile_indices.push(index);
            }
        }
        console_log(format!("[WASM] relevant tiles {}", self.state.relevant_tile_indices.len()).as_str());
    }

    pub fn update_terrain_tile_vertices(&mut self) {
        let color_land_light: [f32; 3] = [148.0 / 255.0, 155.0 / 255.0, 100.0 / 255.0];
        let color_land_dark: [f32; 3] = [116.0 / 255.0, 126.0 / 255.0, 87.0 / 255.0];

        // todo: possible optimization: count instances before and init vecs with correct capacity
        let vertex_data = &mut self.vertex_data;
        vertex_data.land.clear();
        vertex_data.water.clear();
        vertex_data.fog.clear();

        for index in &self.state.relevant_tile_indices {
            let tile = &self.state.tiles[*index];
            let border = &self.state.borders[*index];

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
        let vertex_data = &mut self.vertex_data;
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

        for index in &self.state.relevant_tile_indices {
            let tile = &self.state.tiles[*index];
            let border = &self.state.borders[*index];

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

        let tile_width = 10.0;
        let tile_height = 7.0;

        let vertex_data = &mut self.vertex_data;
        vertex_data.map_detail.clear();

        let atlas_entries_mountain = &self.state.texture_atlas_entries["terrain_mountain"];
        let atlas_entries_hill = &self.state.texture_atlas_entries["terrain_hill"];
        let atlas_entries_forest = &self.state.texture_atlas_entries["terrain_forest"];
        let atlas_entries_terrain_decoration =
            &self.state.texture_atlas_entries["terrain_decoration"];
        let atlas_entries_houses = &self.state.texture_atlas_entries["settlement_houses_all"];
        let atlas_entries_settlement_decoration =
            &self.state.texture_atlas_entries["settlement_decoration"];
        let atlas_entries_units = &self.state.texture_atlas_entries["unit"];
        let atlas_entries_road = &self.state.texture_atlas_entries["road"];

        // routes line mesh config
        let route_mesh_config = LineMeshConfig {
            thickness: 0.8,
            cap_start: cap_butt_start,
            cap_end: cap_butt_end,
            join: join_miter,
        };

        // routes mesh uv
        let mut route_u_min: f32 = 99999999.9;
        let mut route_v_min: f32 = 99999999.9;
        let mut route_u_max: f32 = -99999999.9;
        let mut route_v_max: f32 = -99999999.9;
        for texture_coordinate in atlas_entries_road[0].texture_coordinates.chunks_exact(2) {
            route_u_min = route_u_min.min(texture_coordinate[0]);
            route_v_min = route_v_min.min(texture_coordinate[1]);
            route_u_max = route_u_max.max(texture_coordinate[0]);
            route_v_max = route_v_max.max(texture_coordinate[1]);
        }

        // add routes
        for route in &self.state.routes {

            let mut rng = Random::new((route.first().unwrap().route_id) as u64);

            let n_tiles: f32 = route.len() as f32;

            let route_points: Vec<Vec2d> = route
                .iter()
                .map(|it| Vec2d {
                    x: it.world_x,
                    y: it.world_y,
                })
                .collect();

            let mut route_points_smooth: Vec<Vec2d> = Vec::new();

            if route_points.len() <= 2 {
                route_points_smooth.extend(route_points);

            } else {
                route_points_smooth.push(route_points.first().unwrap().copy());

                for point in route_points.windows(3) {

                    let prev = &point[0];
                    let curr = &point[1];
                    let next = &point[2];

                    let ah = prev.add(&prev.to(curr).scale(0.5));
                    let b = curr;
                    let bh = curr.add(&curr.to(next).scale(0.5));

                    for i in 0..7 {
                        let t = (i as f32) / 7.0;
                        let p = interpolate_curve(&ah, &b, &bh, t);

                        let offset = Vec2d {
                            x: (rng.f32() * 2.0 - 1.0) * 0.3,
                            y: (rng.f32() * 2.0 - 1.0) * 0.3,
                        };

                        let p0 = p.add(&offset);

                        route_points_smooth.push(p0);
                    }
                }

                route_points_smooth.push(route_points.last().unwrap().copy());
            }

            let route_mesh = build_line_mesh(&route_points_smooth, &route_mesh_config);

            for triangle in route_mesh.triangles {
                for vertex_index in triangle {
                    let line_vertex = &route_mesh.vertices[vertex_index];

                    let mut u = line_vertex.u;
                    let mut v = line_vertex.v;
                    u = triangle_wave(u, ((n_tiles - 1.0) / 2.0) + 1.0) / 2.0;
                    u = u * (route_u_max - route_u_min) + route_u_min;
                    v = v * (route_v_max - route_v_min) + route_v_min;

                    vertex_data.map_detail.push(MapDetailVertex {
                        position: [line_vertex.x, line_vertex.y, line_vertex.y - 2.0],
                        texture_coordinates: [u, v],
                        base_color: [0.0, 0.0, 0.0],
                        country_color: [0.0, 0.0, 0.0],
                    })
                }
            }
        }

        // add world objects
        for world_object in &self.state.world_objects {
            let x = world_object.world_x;
            let y = world_object.world_y - tile_height / 2.0;
            let z = y - 1.0;

            vertex_data.map_detail.extend(Self::create_sprite(
                &atlas_entries_units[0],
                (x, y),
                (z, z),
                (7.0, 7.0),
                [0.0, 0.0, 0.0],
                [
                    world_object.country_color_r,
                    world_object.country_color_g,
                    world_object.country_color_b,
                ],
            ));
        }

        // add settlements
        for settlement in &self.state.settlements {
            let mut rng = Random::new((settlement.position_q * 3 + settlement.position_r * 5) as u64);
            for _i in 0..=(settlement.population_size + 1) {
                let x = settlement.world_x + (rng.f32() * 2.0 - 1.0) * tile_width / 2.0;
                let y = settlement.world_y + (rng.f32() * 2.0 - 1.0) * tile_height / 2.0;
                let z = y - 1.0;
                vertex_data.map_detail.extend(Self::create_sprite(
                    &atlas_entries_houses[(rng.f32() * atlas_entries_houses.len() as f32) as usize],
                    (x, y),
                    (z, z),
                    (5.0, 5.0),
                    [0.0, 0.0, 0.0],
                    [0.0, 0.0, 0.0],
                ));
            }

            for _i in 0..(settlement.population_size) {
                let x = settlement.world_x + (rng.f32() * 2.0 - 1.0) * tile_width / 2.0;
                let y = settlement.world_y + (rng.f32() * 2.0 - 1.0) * tile_height / 2.0;
                let z = y - 1.0;
                vertex_data.map_detail.extend(Self::create_sprite(
                    &atlas_entries_settlement_decoration
                        [(rng.f32() * atlas_entries_settlement_decoration.len() as f32) as usize],
                    (x, y),
                    (z, z),
                    (4.0, 4.0),
                    [0.0, 0.0, 0.0],
                    [0.0, 0.0, 0.0],
                ));
            }
        }

        // add terrain
        for index in &self.state.relevant_tile_indices {
            let tile = &self.state.tiles[*index];

            if tile.visibility == 2 {
                continue;
            }
            if tile.terrain_type != 1 {
                continue;
            }

            let height_jitter = tile.random_1 * 0.1 - 0.5;
            let height = tile.height * 2.0 + height_jitter;
            let color = mix(&color_land_light, &color_land_dark, height);

            let mut terrain = "none";
            if tile.random_1 > 0.8 {
                terrain = "mountain"
            } else if tile.random_1 > 0.65 {
                terrain = "hill"
            } else if tile.random_1 > 0.5 {
                terrain = "forest"
            } else {
                terrain = "none"
            }

            match terrain {
                "mountain" => {
                    vertex_data.map_detail.extend(Self::create_sprite(
                        &atlas_entries_mountain
                            [(tile.random_1 * atlas_entries_mountain.len() as f32) as usize],
                        (tile.world_x, tile.world_y - tile_height),
                        (
                            tile.world_y - tile_height + tile.random_2 * 0.1,
                            tile.world_y + tile_height + tile.random_2 * 0.1,
                        ),
                        (22.0, 16.0),
                        color,
                        [0.0, 0.0, 0.0],
                    ));
                }
                "hill" => {
                    vertex_data.map_detail.extend(Self::create_sprite(
                        &atlas_entries_hill
                            [(tile.random_1 * atlas_entries_hill.len() as f32) as usize],
                        (tile.world_x, tile.world_y - tile_height),
                        (
                            tile.world_y - tile_height + tile.random_2 * 0.1,
                            tile.world_y + tile_height + tile.random_2 * 0.1,
                        ),
                        (22.0, 16.0),
                        color,
                        [0.0, 0.0, 0.0],
                    ));
                }
                "forest" => {
                    vertex_data.map_detail.extend(Self::create_sprite(
                        &atlas_entries_forest
                            [(tile.random_1 * atlas_entries_forest.len() as f32) as usize],
                        (tile.world_x, tile.world_y - tile_height),
                        (
                            tile.world_y - tile_height + tile.random_2 * 0.1,
                            tile.world_y + tile_height + tile.random_2 * 0.1,
                        ),
                        (22.0, 16.0),
                        color,
                        [0.0, 0.0, 0.0],
                    ));
                }
                "none" | _ => {
                    for _i in 0..((tile.random_1 * 5.0) + 1.0) as i32 {
                        let rng_offset_x = tile.random_0;
                        let rng_offset_y = tile.random_2;
                        let x = tile.world_x + (rng_offset_x * 2.0 - 1.0) * (tile_width / 2.0);
                        let y = tile.world_y + (rng_offset_y * 2.0 - 1.0) * (tile_height / 2.0);
                        let z = y - 1.0;

                        vertex_data.map_detail.extend(Self::create_sprite(
                            &atlas_entries_terrain_decoration[(tile.random_1
                                * atlas_entries_terrain_decoration.len() as f32)
                                as usize],
                            (x, y),
                            (z, z),
                            (4.0, 4.0),
                            [0.0, 0.0, 0.0],
                            [0.0, 0.0, 0.0],
                        ));
                    }
                }
            }
        }
    }

    fn create_sprite(
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
        &self.vertex_data.water
    }

    pub fn get_vertex_buffer_land(&self) -> &Vec<LandTileVertex> {
        &self.vertex_data.land
    }

    pub fn get_vertex_buffer_fog(&self) -> &Vec<FogTileVertex> {
        &self.vertex_data.fog
    }

    pub fn get_vertex_buffer_overlay(&self) -> &Vec<OverlayTileVertex> {
        &self.vertex_data.overlay
    }

    pub fn get_vertex_buffer_detail(&self) -> &Vec<MapDetailVertex> {
        &self.vertex_data.map_detail
    }
}
