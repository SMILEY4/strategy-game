use crate::js::models::{Control, Entity, Tile};
use crate::render::Renderer;

impl Renderer {
    pub fn set_tiles(&mut self, tiles: Vec<Tile>) {
        self.state.tiles = tiles;
        self.state.tiles.sort_by_key(|it| it.rng_seed);

        self.state.tiles_by_position.clear();
        self.state.tiles_by_position.reserve(self.state.tiles.len());
        for (index, tile) in self.state.tiles.iter().enumerate() {
            self.state
                .tiles_by_position
                .insert(tile.tile_position, index);
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

    pub fn set_entities(&mut self, entities: Vec<Entity>) {
        self.state.entities = entities;
        self.state.chunks.clear();
        self.state.visible_chunks.clear();
    }
}
