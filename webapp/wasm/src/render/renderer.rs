use crate::js::models::{Control, Entity, HexPosition, SpriteSheetEntry, Tile};
use crate::render::{creator_map_detail_instances, creator_overlay_instances, creator_terrain_tile_instances};
use crate::render::models::chunk::Chunk;
use crate::render::models::config::RenderConfig;
use crate::render::models::render_state::RenderState;
use crate::render::models::tile_instance_data::{GenericEdgeOverlayInstance, GenericFillOverlayInstance, GridOverlayInstance, MapDetailVertex, MapDetailsVertexData, OverlayVertexData, TileFogOfWarInstance, TileInstanceData, TileTerrainLandInstance, TileTerrainWaterInstance};
use std::collections::HashSet;
use rustc_hash::FxHashMap;

pub struct Renderer {
    config: RenderConfig,
    state: RenderState,
    tile_instance_data: TileInstanceData,
    map_detail_vertex_data: MapDetailsVertexData,
    overlay_vertex_data: OverlayVertexData,
}

impl Renderer {
    pub fn new() -> Renderer {
        Renderer {
            config: RenderConfig::default(),
            state: RenderState::default(),
            tile_instance_data: TileInstanceData::default(),
            map_detail_vertex_data: MapDetailsVertexData::default(),
            overlay_vertex_data: OverlayVertexData::default(),
        }
    }

    /// initialize renderer once at startup/creation
    pub fn initialize(&mut self) {
        creator_overlay_instances::build_tile_grid(&self.state, &mut self.overlay_vertex_data);
    }
    
    /// add the sprite sheet entries with the given group id
    pub fn set_spritesheet_entries(&mut self, group_id: u8, entries: Vec<SpriteSheetEntry>) {
        self.config.spritesheet_entries.insert(group_id as i32, entries);
    }

    /// Set the complete list of tiles for this renderer
    pub fn set_tiles(&mut self, tiles: Vec<Tile>) {
        self.state.tiles = tiles;
        self.state.tiles.sort_by_key(|it| it.rng_seed);

        self.state.tiles_by_position.clear();
        self.state.tiles_by_position.reserve(self.state.tiles.len());
        for (index, tile) in self.state.tiles.iter().enumerate() {
            self.state.tiles_by_position.insert(tile.tile_position, index);
        }

        self.state.chunks.clear();
        self.state.visible_chunks.clear();
    }

    pub fn set_tile_control_values(&mut self, controls: Vec<Control>) {
        self.state.controls = controls;
    }

    pub fn set_map_mode(&mut self, map_mode: u32) {
        self.state.map_mode = map_mode;
    }

    pub fn set_selected_entity_id(&mut self, entity_id: Option<u32>) {
        self.state.selected_entity_id = entity_id;
    }

    /// Set the complete list of entities for this renderer
    pub fn set_entities(&mut self, entities: Vec<Entity>) {
        self.state.entities = entities;
        self.state.chunks.clear();
        self.state.visible_chunks.clear();
    }

    /// Calculate/update all chunks given the current complete list of tiles.
    /// Returns whether the list of chunks changed (independent of order or contained tiles)
    pub fn calculate_all_chunks(&mut self) -> bool {
        
        let mut new_chunks: FxHashMap<HexPosition, Chunk> = FxHashMap::default();
        
        for (index, tile) in self.state.tiles.iter().enumerate() {
            new_chunks
                .entry(tile.chunk_position)
                .or_insert_with(|| Chunk {
                    chunk_position: tile.chunk_position,
                    tiles: Vec::new(),
                    entities: Vec::new(),
                })
                .tiles
                .push(index);
        }

        for (index, entity) in self.state.entities.iter().enumerate() {
            new_chunks
                .entry(entity.chunk_position)
                .or_insert_with(|| Chunk {
                    chunk_position: entity.chunk_position,
                    tiles: Vec::new(),
                    entities: Vec::new(),
                })
                .entities
                .push(index);
        }
        
        let changed_keys = self.state.chunks.len() != new_chunks.len()
            || self
                .state
                .chunks
                .keys()
                .any(|key| !new_chunks.contains_key(key));

        if changed_keys {
            self.state.visible_chunks.clear();
        }
        self.state.chunks = new_chunks; // chunks always need to be updated regardless of "changed", since the content might have changed
        changed_keys
    }

    /// Calculate/update the subset of chunks visible to the current camera.
    /// Returns whether the list of chunks changed (independent of order or contained tiles)
    pub fn calculate_visible_chunks(&mut self) -> bool {
        let is_visible = |pos: &HexPosition, chunk: &Chunk| -> bool {
            true // todo: implement later
        };

        let new_visible: HashSet<HexPosition> = self
            .state
            .chunks
            .iter()
            .filter(|(pos, chunk)| is_visible(pos, chunk))
            .map(|(&pos, _)| pos)
            .collect();

        let changed = self.state.visible_chunks != new_visible;
        self.state.visible_chunks = new_visible;
        changed
    }

    pub fn build_overlay_instances(&mut self) {
        let map_mode = self.state.map_mode;
        let entity_edges = self
            .state
            .selected_entity_id
            .map(creator_overlay_instances::entity_control_edges);

        creator_overlay_instances::build_overlay(
            &self.state,
            &mut self.overlay_vertex_data,
            move |state, tile, output| {
                match map_mode {
                    _ => creator_overlay_instances::no_overlay_fill(state, tile, output),
                }
            },
            move |state, tile, tiles_by_position, output| {
                match map_mode {
                    _ => creator_overlay_instances::no_overlay_edges(
                        state,
                        tile,
                        tiles_by_position,
                        output,
                    ),
                }

                if let Some(create_entity_edges) = &entity_edges {
                    create_entity_edges(state, tile, tiles_by_position, output);
                }
            },
        );
    }

    pub fn calculate_instances(&mut self) {
        creator_terrain_tile_instances::build(&self.state, &mut self.tile_instance_data);
        creator_map_detail_instances::build(&self.config, &self.state, &mut self.map_detail_vertex_data);
    }

    pub fn get_terrain_tile_instances_land(&self) -> &Vec<TileTerrainLandInstance> {
        &self.tile_instance_data.terrain_land
    }

    pub fn get_terrain_tile_instances_water(&self) -> &Vec<TileTerrainWaterInstance> {
        &self.tile_instance_data.terrain_water
    }

    pub fn get_fog_of_war_tile_instances(&self) -> &Vec<TileFogOfWarInstance> {
        &self.tile_instance_data.fog_of_war
    }

    pub fn get_map_detail_vertices(&self) -> &Vec<MapDetailVertex> {
        &self.map_detail_vertex_data.map_detail_vertices
    }

    pub fn get_grid_instances(&self) -> &Vec<GridOverlayInstance> {
        &self.overlay_vertex_data.grid_instances
    }

    pub fn get_overlay_fill_instances(&self) -> &Vec<GenericFillOverlayInstance> {
        &self.overlay_vertex_data.fill_instances
    }

    pub fn get_overlay_edge_instances(&self) -> &Vec<GenericEdgeOverlayInstance> {
        &self.overlay_vertex_data.edge_instances
    }

}
