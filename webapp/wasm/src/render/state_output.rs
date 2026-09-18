use crate::render::models::gpu::{GenericEdgeOverlayInstance, GenericFillOverlayInstance, GridOverlayInstance, MapDetailVertex, RouteVertex, TileFogOfWarInstance, TileTerrainLandInstance, TileTerrainWaterInstance, WaterEdgeInstance};

#[derive(Default)]
pub struct OutputState {

    pub terrain_land_instances: Vec<TileTerrainLandInstance>,
    pub terrain_water_instances: Vec<TileTerrainWaterInstance>,
    pub water_edge_instances: Vec<WaterEdgeInstance>,
    pub fog_of_war_instances: Vec<TileFogOfWarInstance>,

    pub map_detail_vertices: Vec<MapDetailVertex>,

    pub route_vertices: Vec<RouteVertex>,
    
    pub overlay_grid_instances: Vec<GridOverlayInstance>,
    pub overlay_fill_instances: Vec<GenericFillOverlayInstance>,
    pub overlay_edge_instances: Vec<GenericEdgeOverlayInstance>
}