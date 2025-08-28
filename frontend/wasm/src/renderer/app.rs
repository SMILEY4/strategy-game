use crate::js::models::{
    RouteNode, Settlement, TextureAtlasEntry, Tile, TilePosition, WorldObject,
};
use crate::renderer::models::{
    FogTileVertex, LandTileVertex, MapDetailVertex, OverlayTileVertex, RenderState, VertexData,
    WaterTileVertex,
};
use crate::renderer::{
    border_calculator, creator_details, creator_overlay_tile, creator_terrain_tile,
};
use crate::utils::Rect2d;
use std::collections::{HashMap, HashSet};
use std::iter::FromIterator;

/// Wasm support for the game renderer.
/// Keeps its own copy of relevant game state.
/// Writes vertices to wasm memory that can be shared with js and webgl.
pub struct RenderApp {
    state: RenderState,
    vertex_data: VertexData,
}

/// Wasm support for the game renderer.
impl RenderApp {
    /// Create a new empty renderer.
    pub fn new() -> RenderApp {
        RenderApp {
            state: RenderState::default(),
            vertex_data: VertexData::default(),
        }
    }

    /// set/initialize the texture atlas.
    pub fn set_texture_atlas_entries(&mut self, entries: HashMap<String, Vec<TextureAtlasEntry>>) {
        self.state.texture_atlas_entries = entries;
    }

    /// Set the current map mode.
    /// This does not automatically trigger a re-calculation of anything else.
    pub fn set_map_mode(&mut self, map_mode: String) {
        self.state.map_mode = map_mode;
    }

    /// Set/Update the routes.
    /// This does not automatically trigger a re-calculation of anything else.
    pub fn set_routes(&mut self, routes: Vec<Vec<RouteNode>>) {
        self.state.routes = routes;
    }

    /// Set/Update all tiles.
    /// This does not automatically trigger a re-calculation of anything else.
    pub fn set_tiles(&mut self, tiles: Vec<Tile>) {
        self.state.tiles = tiles;
        self.update_relevant_area();
    }

    /// Set/Update the settlements.
    /// This does not automatically trigger a re-calculation of anything else.
    pub fn set_settlements(&mut self, settlements: Vec<Settlement>) {
        self.state.settlements = settlements;
    }

    /// Set/Update the world objects.
    /// This does not automatically trigger a re-calculation of anything else.
    pub fn set_world_objects(&mut self, world_objects: Vec<WorldObject>) {
        self.state.world_objects = world_objects;
    }

    /// Set/Update the current move targets.
    /// This does not automatically trigger a re-calculation of anything else.
    pub fn set_move_targets(&mut self, targets: Vec<TilePosition>) {
        self.state.move_targets = HashSet::from_iter(targets);
    }

    /// Set/Update the current relevant world area.
    /// Steps may skip tiles that are not in these bounds.
    /// This does not automatically trigger a re-calculation of anything else.
    pub fn set_relevant_world_area(&mut self, min_x: f32, min_y: f32, max_x: f32, max_y: f32) {
        let area = Rect2d {
            min_x: min_x,
            min_y: min_y,
            max_x: max_x,
            max_y: max_y,
        };
        self.state.relevant_world_area = area;
    }

    /// Re-calculate the list of tiles in the relevant area.
    pub fn update_relevant_area(&mut self) {
        self.state.relevant_tile_indices.clear();
        for (index, tile) in self.state.tiles.iter().enumerate() {
            if self
                .state
                .relevant_world_area
                .contains_point(tile.world_x, tile.world_y)
            {
                self.state.relevant_tile_indices.push(index);
            }
        }
    }

    /// Re-calculate the border data for all relevant tiles.
    /// Data from this step is required for other steps (e.g. terrain tiles, overlay, ...)
    pub fn update_border_data(&mut self) {
        self.state.borders = border_calculator::build_tile_borders(&self.state.tiles)
    }

    /// Re-calculate the vertex data for terrain tiles (land, water, fog).
    pub fn update_terrain_tile_vertices(&mut self) {
        creator_terrain_tile::update(&self.state, &mut self.vertex_data);
    }

    /// Re-calculate the vertex data for overlay tiles.
    pub fn update_overlay_tile_vertices(&mut self) {
        creator_overlay_tile::update(&self.state, &mut self.vertex_data);
    }

    /// Re-calculate the vertex data for map details.
    pub fn update_detail_vertices(&mut self) {
        creator_details::update(&self.state, &mut self.vertex_data);
    }

    /// returns the current vertex data for water tiles.
    pub fn get_vertex_buffer_water(&self) -> &Vec<WaterTileVertex> {
        &self.vertex_data.water
    }

    /// returns the current vertex data for land tiles.
    pub fn get_vertex_buffer_land(&self) -> &Vec<LandTileVertex> {
        &self.vertex_data.land
    }

    /// returns the current vertex data for fog tiles.
    pub fn get_vertex_buffer_fog(&self) -> &Vec<FogTileVertex> {
        &self.vertex_data.fog
    }

    /// returns the current vertex data for overlay tiles.
    pub fn get_vertex_buffer_overlay(&self) -> &Vec<OverlayTileVertex> {
        &self.vertex_data.overlay
    }

    /// returns the current vertex data for map details.
    pub fn get_vertex_buffer_detail(&self) -> &Vec<MapDetailVertex> {
        &self.vertex_data.map_detail
    }
}
