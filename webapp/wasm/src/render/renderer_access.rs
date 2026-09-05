use crate::render::models::gpu::{
    GenericEdgeOverlayInstance, GenericFillOverlayInstance, GridOverlayInstance, MapDetailVertex,
    TileFogOfWarInstance, TileTerrainLandInstance, TileTerrainWaterInstance,
};
use crate::render::Renderer;

impl Renderer {
    pub fn get_terrain_land_instances(&self) -> &Vec<TileTerrainLandInstance> {
        &self.output.terrain_land_instances
    }

    pub fn get_terrain_water_instances(&self) -> &Vec<TileTerrainWaterInstance> {
        &self.output.terrain_water_instances
    }

    pub fn get_fog_of_war_instances(&self) -> &Vec<TileFogOfWarInstance> {
        &self.output.fog_of_war_instances
    }

    pub fn get_map_detail_vertices(&self) -> &Vec<MapDetailVertex> {
        &self.output.map_detail_vertices
    }

    pub fn get_overlay_grid_instances(&self) -> &Vec<GridOverlayInstance> {
        &self.output.overlay_grid_instances
    }

    pub fn get_overlay_fill_instances(&self) -> &Vec<GenericFillOverlayInstance> {
        &self.output.overlay_fill_instances
    }

    pub fn get_overlay_edge_instances(&self) -> &Vec<GenericEdgeOverlayInstance> {
        &self.output.overlay_edge_instances
    }
}
