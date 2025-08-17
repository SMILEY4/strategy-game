use crate::js::models::Tile;
use crate::renderer::border;
use crate::renderer::models::{FogTileVertex, LandTileVertex, WaterTileVertex};
use crate::renderer::state::RenderState;
use crate::utils::math::mix;

pub struct RenderApp {
    state: RenderState,
}

impl RenderApp {
    pub fn new() -> RenderApp {
        RenderApp {
            state: RenderState::new(),
        }
    }

    pub fn set_tiles(&mut self, tiles: Vec<Tile>) {
        self.state.tiles = tiles;
    }

    pub fn update_border_data(&mut self) {
        self.state.borders = border::build_tile_borders(&self.state.tiles)
    }

    pub fn update_terrain_tile_vertices(&mut self) {

        let color_land_light: [f32; 3] = [148.0 / 255.0, 155.0 / 255.0, 100.0 / 255.0];
        let color_land_dark: [f32; 3] = [116.0 / 255.0, 126.0 / 255.0, 87.0 / 255.0];

        // todo: possible optimization: count types before and init vecs with correct capacity
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

    pub fn get_vertex_buffer_water(&self) -> &Vec<WaterTileVertex> {
        &self.state.vertex_data.water
    }

    pub fn get_vertex_buffer_land(&self) -> &Vec<LandTileVertex> {
        &self.state.vertex_data.land
    }

    pub fn get_vertex_buffer_fog(&self) -> &Vec<FogTileVertex> {
        &self.state.vertex_data.fog
    }
}
