use crate::render::gpu::map_details::build_map_details_data;
use crate::render::gpu::overlay::build_overlay_data;
use crate::render::gpu::terrain::build_terrain_data;
use crate::render::gpu::tile_grid::build_tile_grid_data;
use crate::render::statial::chunk_visibility::calculate_visible_chunks;
use crate::render::statial::spatial_indexing::{calculate_chunks, check_changes};
use crate::render::Renderer;

impl Renderer {
    pub fn calculate_all_chunks(&mut self) -> bool {
        let new_chunks = calculate_chunks(&self.state.tiles, &self.state.entities);
        let changed_keys = check_changes(&self.state.chunks, &new_chunks);
        if changed_keys {
            self.state.visible_chunks.clear();
        }
        self.state.chunks = new_chunks; // Note: chunks always need to be updated regardless of "changed", since the content might have changed
        changed_keys
    }

    pub fn calculate_visible_chunks(&mut self) -> bool {
        let visible_chunks = calculate_visible_chunks(&self.state.chunks);
        let changed = self.state.visible_chunks != visible_chunks;
        self.state.visible_chunks = visible_chunks;
        changed
    }

    pub fn build_overlay_instances(&mut self) {
        build_overlay_data(&self.state, &mut self.output);
    }

    pub fn build_grid_instances(&mut self) {
        build_tile_grid_data(&mut self.output);
    }

    pub fn build_terrain_instances(&mut self) {
        build_terrain_data(&self.state, &mut self.output);
    }

    pub fn build_map_details_instances(&mut self) {
        build_map_details_data(&self.state, &self.config, &mut self.output);
    }
}
