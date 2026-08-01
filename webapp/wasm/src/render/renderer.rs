use crate::js::models::{HexPosition, Tile};
use crate::render::creator_terrain_tile_instances;
use crate::render::models::chunk::Chunk;
use crate::render::models::config::RenderConfig;
use crate::render::models::render_state::RenderState;
use crate::render::models::tile_instance_data::{TileFogOfWarInstance, TileInstanceData, TileTerrainLandInstance, TileTerrainWaterInstance};
use std::collections::{HashMap, HashSet};

pub struct Renderer {
    config: RenderConfig,
    state: RenderState,
    tile_instance_data: TileInstanceData,
}

impl Renderer {
    pub fn new() -> Renderer {
        Renderer {
            config: RenderConfig {},
            state: RenderState::default(),
            tile_instance_data: TileInstanceData::default(),
        }
    }

    /// Set the complete list of tiles for this renderer
    pub fn set_tiles(&mut self, tiles: Vec<Tile>) {
        self.state.tiles = tiles;
        self.state.tiles.sort_by_key(|it| it.rng_seed);
        self.state.chunks.clear();
        self.state.visible_chunks.clear();
    }

    /// Calculate/update all chunks given the current complete list of tiles.
    /// Returns whether the list of chunks changed (independent of order or contained tiles)
    pub fn calculate_all_chunks(&mut self) -> bool {
        let mut new_chunks: HashMap<HexPosition, Chunk> = HashMap::new();
        for (index, tile) in self.state.tiles.iter().enumerate() {
            new_chunks
                .entry(tile.chunk_position)
                .or_insert_with(|| Chunk {
                    chunk_position: tile.chunk_position,
                    tiles: Vec::new(),
                })
                .tiles
                .push(index);
        }

        let changed = self.state.chunks.len() != new_chunks.len()
            || self
                .state
                .chunks
                .keys()
                .any(|key| !new_chunks.contains_key(key));

        if changed {
            self.state.visible_chunks.clear();
        }
        self.state.chunks = new_chunks; // chunks always need to be updated regardless of "changed", since the contained tiles might have changed
        changed
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

    pub fn calculate_terrain_tile_instances(&mut self) {
        creator_terrain_tile_instances::build(&self.state, &mut self.tile_instance_data);
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

}
