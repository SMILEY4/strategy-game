use crate::render::models::gpu::{GenericEdgeOverlayInstance, GenericFillOverlayInstance, GridOverlayInstance, MapDetailVertex, RouteVertex, TileFogOfWarInstance, TileTerrainLandInstance, TileTerrainWaterInstance, WaterEdgeInstance};
use crate::render::Renderer;

impl Renderer {
    pub fn get_terrain_land_instances(&self) -> &[TileTerrainLandInstance] {
        &self.output.terrain_land_instances
    }

    pub fn get_terrain_water_instances(&self) -> &[TileTerrainWaterInstance] {
        &self.output.terrain_water_instances
    }

    pub fn get_water_edge_instances(&self) -> &[WaterEdgeInstance] {
        &self.output.water_edge_instances
    }

    pub fn get_fog_of_war_instances(&self) -> &[TileFogOfWarInstance] {
        &self.output.fog_of_war_instances
    }

    pub fn get_map_detail_vertices(&self) -> &[MapDetailVertex] {
        &self.output.map_detail_vertices
    }

    pub fn get_overlay_grid_instances(&self) -> &[GridOverlayInstance] {
        &self.output.overlay_grid_instances
    }

    pub fn get_overlay_fill_instances(&self) -> &[GenericFillOverlayInstance] {
        &self.output.overlay_fill_instances
    }

    pub fn get_overlay_edge_instances(&self) -> &[GenericEdgeOverlayInstance] {
        &self.output.overlay_edge_instances
    }

    pub fn get_route_vertices(&self) -> &[RouteVertex] {
        &self.output.route_vertices
    }

    pub fn get_route_highlight_vertices(&self) -> &[RouteVertex] {
        &self.output.route_highlight_vertices
    }
}
