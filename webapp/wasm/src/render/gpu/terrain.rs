use crate::js::models::{
    HexPosition, Tile, TILE_BIOME_GRASSLAND, TILE_BIOME_OCEAN, TILE_VISIBILITY_UNDISCOVERED,
};
use crate::render::models::gpu::{
    TileFogOfWarInstance, TileTerrainLandInstance, TileTerrainWaterInstance, WaterEdgeInstance,
};
use crate::render::state_output::OutputState;
use crate::render::state_render::RenderState;

pub fn build_terrain_data(state: &RenderState, output: &mut OutputState) {
    output.terrain_land_instances.clear();
    output.terrain_water_instances.clear();
    output.water_edge_instances.clear();
    output.fog_of_war_instances.clear();

    // for each (visible) tile
    state.visible_chunks.iter().for_each(|chunk_key| {
        let chunk = state.chunks.get(chunk_key).unwrap();
        chunk.tiles.iter().for_each(|tile_index| {
            let tile = state.tiles[*tile_index];

            // create fog-of-war for at least discovered tiles
            if tile.visibility != TILE_VISIBILITY_UNDISCOVERED {
                build_fog_of_war_instance(tile, output);
            }

            // undiscovered -> no terrain visible -> skip
            if tile.visibility == TILE_VISIBILITY_UNDISCOVERED {
                return;
            }

            // build land instance
            if tile.terrain.biome == TILE_BIOME_GRASSLAND {
                build_land_instance(tile, output);
                return;
            }

            // build water & water edge instances
            if tile.terrain.biome == TILE_BIOME_OCEAN {
                build_water_instance(tile, output);
                build_water_edge_instances(state, tile.tile_position, output);
                return;
            }
        })
    });
}

fn build_fog_of_war_instance(tile: Tile, output: &mut OutputState) {
    output.fog_of_war_instances.push(TileFogOfWarInstance {
        position: [tile.tile_position.q as f32, tile.tile_position.r as f32],
        visibility: tile.visibility,
        _padding: [0, 0, 0],
    });
}

fn build_land_instance(tile: Tile, output: &mut OutputState) {
    output.terrain_land_instances.push(TileTerrainLandInstance {
        position: [tile.tile_position.q as f32, tile.tile_position.r as f32],
    });
}

fn build_water_instance(tile: Tile, output: &mut OutputState) {
    output
        .terrain_water_instances
        .push(TileTerrainWaterInstance {
            position: [tile.tile_position.q as f32, tile.tile_position.r as f32],
        });
}

fn build_water_edge_instances(
    state: &RenderState,
    position: HexPosition,
    output: &mut OutputState,
) {
    // The slice mesh starts at the edge toward (q - 1, r + 1), then advances
    // clockwise. These are the corresponding neighbour direction IDs used by
    // wateredge.vsh, where direction 4 is the unrotated slice.
    let edge_directions = [4, 3, 2, 1, 0, 5];
    let neighbours = [
        HexPosition {
            q: position.q - 1,
            r: position.r + 1,
        },
        HexPosition {
            q: position.q - 1,
            r: position.r,
        },
        HexPosition {
            q: position.q,
            r: position.r - 1,
        },
        HexPosition {
            q: position.q + 1,
            r: position.r - 1,
        },
        HexPosition {
            q: position.q + 1,
            r: position.r,
        },
        HexPosition {
            q: position.q,
            r: position.r + 1,
        },
    ];

    for direction in 0..6 {
        let edge_neighbour = direction;
        let vertex_two_neighbour = (direction + 5) % 6;
        let vertex_three_neighbour = (direction + 1) % 6;

        let edge_land = land_neighbour(state, neighbours[edge_neighbour]).is_some();
        let vertex_two_land = land_neighbour(state, neighbours[vertex_two_neighbour]).is_some();
        let vertex_three_land = land_neighbour(state, neighbours[vertex_three_neighbour]).is_some();

        if edge_land || vertex_two_land || vertex_three_land {
            let ext_two_land = edge_land != vertex_two_land;
            let ext_three_land = edge_land != vertex_three_land;

            output.water_edge_instances.push(WaterEdgeInstance {
                position: [position.q as f32, position.r as f32],
                direction: edge_directions[direction],
                land_direction: [
                    if edge_land { 1.0 } else { 0.0 },
                    if vertex_two_land { 1.0 } else { 0.0 },
                    if vertex_three_land { 1.0 } else { 0.0 },
                ],
                extended_land: [
                    if ext_two_land { 1.0 } else { 0.0 },
                    if ext_three_land { 1.0 } else { 0.0 },
                ],
            });
        }
    }
}

fn land_neighbour(state: &RenderState, position: HexPosition) -> Option<HexPosition> {
    let tile_index = state.tiles_by_position.get(&position)?;
    (state.tiles[*tile_index].terrain.biome == TILE_BIOME_GRASSLAND).then_some(position)
}
