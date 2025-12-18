use crate::js::models::TextureAtlasEntry;
use crate::renderer::models::{MapDetailVertex, RenderState, RendererConfiguration, VertexData};
use crate::utils::{mix, rgb_f32_to_u8, Random};

/// Calculate the map details vertex data from the given render state.
/// Writes the result to the given vertex data.
pub fn update(state: &RenderState, config: &RendererConfiguration, vertex_data: &mut VertexData) {
    vertex_data.map_detail.clear();

    let atlas_entries_mountain = &state.texture_atlas_entries["terrain_mountain"];
    let atlas_entries_hill = &state.texture_atlas_entries["terrain_hill"];
    let atlas_entries_forest = &state.texture_atlas_entries["terrain_forest"];
    let atlas_entries_terrain_decoration = &state.texture_atlas_entries["terrain_decoration"];
    let atlas_entries_units = &state.texture_atlas_entries["unit"];
    let atlas_entries_houses = &state.texture_atlas_entries["settlement_houses_all"];


    let mut rng = Random::new(0);

    // add world objects
    for world_object in &state.world_objects {

        let x = world_object.world_x;
        let y = world_object.world_y - config.tile_height / 2.0;
        let z = y - 1.0;

        // unit
        if world_object.type_group == 1 {
            vertex_data.map_detail.extend(create_sprite(
                &atlas_entries_units[0],
                (x, y),
                (z, z),
                (7.0, 7.0),
                [0, 0, 0],
                [
                    world_object.realm_color_r,
                    world_object.realm_color_g,
                    world_object.realm_color_b,
                ],
            ));
        }

        // tile improvement
        if world_object.type_group == 2 {
            vertex_data.map_detail.extend(create_sprite(
                &atlas_entries_houses[(rng.f32() * atlas_entries_houses.len() as f32) as usize],
                (x, y),
                (z, z),
                (7.0, 7.0),
                [0, 0, 0],
                [
                    world_object.realm_color_r,
                    world_object.realm_color_g,
                    world_object.realm_color_b,
                ],
            ));
        }

        // settlement
        if world_object.type_group == 3 {
            for _ in 0..5 {
                let offset_x = (rng.f32() * config.tile_width * 2.0) - config.tile_width;
                let offset_y = (rng.f32() * config.tile_height * 2.0) - config.tile_height;
                vertex_data.map_detail.extend(create_sprite(
                    &atlas_entries_houses[(rng.f32() * atlas_entries_houses.len() as f32) as usize],
                    (x + offset_x, y + offset_y),
                    (z, z),
                    (7.0, 7.0),
                    [0, 0, 0],
                    [
                        world_object.realm_color_r,
                        world_object.realm_color_g,
                        world_object.realm_color_b,
                    ],
                ));
            }
        }

    }

    // add terrain
    for index in &state.relevant_tile_indices {
        let tile = &state.tiles[*index];
        rng.set_seed(tile.rng_seed as u64 * 5);

        if tile.visibility == 2 {
            continue;
        }
        if tile.terrain_type != 1 {
            continue;
        }

        let height_jitter = rng.f32() * 0.1 - 0.5;
        let height = tile.height * 2.0 + height_jitter;
        let color = rgb_f32_to_u8(&mix(
            &config.land_color_light,
            &config.land_color_dark,
            height,
        ));

        let rng_terrain = rng.f32();
        let mut terrain = "none";
        if rng_terrain > 0.8 {
            terrain = "mountain"
        } else if rng_terrain > 0.65 {
            terrain = "hill"
        } else if rng_terrain > 0.5 {
            terrain = "forest"
        } else {
            terrain = "none"
        }

        match terrain {
            "mountain" => {
                let texture_index = (rng.f32() * atlas_entries_mountain.len() as f32) as usize;
                vertex_data.map_detail.extend(create_sprite(
                    &atlas_entries_mountain[texture_index],
                    (tile.world_x, tile.world_y - config.tile_height),
                    (
                        tile.world_y - config.tile_height + rng.f32() * 0.1,
                        tile.world_y + config.tile_height + rng.f32() * 0.1,
                    ),
                    (22.0, 16.0),
                    color,
                    [0, 0, 0],
                ));
            }
            "hill" => {
                let texture_index = (rng.f32() * atlas_entries_hill.len() as f32) as usize;
                vertex_data.map_detail.extend(create_sprite(
                    &atlas_entries_hill[texture_index],
                    (tile.world_x, tile.world_y - config.tile_height),
                    (
                        tile.world_y - config.tile_height + rng.f32() * 0.1,
                        tile.world_y + config.tile_height + rng.f32() * 0.1,
                    ),
                    (22.0, 16.0),
                    color,
                    [0, 0, 0],
                ));
            }
            "forest" => {
                let texture_index = (rng.f32() * atlas_entries_forest.len() as f32) as usize;
                vertex_data.map_detail.extend(create_sprite(
                    &atlas_entries_forest[texture_index],
                    (tile.world_x, tile.world_y - config.tile_height),
                    (
                        tile.world_y - config.tile_height + rng.f32() * 0.1,
                        tile.world_y + config.tile_height + rng.f32() * 0.1,
                    ),
                    (22.0, 16.0),
                    color,
                    [0, 0, 0],
                ));
            }
            "none" | _ => {
                for _i in 0..((rng.f32() * 5.0) + 1.0) as i32 {
                    let x = tile.world_x + (rng.f32() * 2.0 - 1.0) * (config.tile_height / 2.0);
                    let y = tile.world_y + (rng.f32() * 2.0 - 1.0) * (config.tile_height / 2.0);
                    let z = y - 1.0;

                    let texture_index =
                        (rng.f32() * atlas_entries_terrain_decoration.len() as f32) as usize;

                    vertex_data.map_detail.extend(create_sprite(
                        &atlas_entries_terrain_decoration[texture_index],
                        (x, y),
                        (z, z),
                        (4.0, 4.0),
                        [0, 0, 0],
                        [0, 0, 0],
                    ));
                }
            }
        }
    }
}

fn create_sprite(
    atlas_entry: &TextureAtlasEntry,
    pos: (f32, f32),
    sprite_z: (f32, f32),
    sprite_scale: (f32, f32),
    color_base: [u8; 3],
    color_realm: [u8; 3],
) -> Vec<MapDetailVertex> {
    let mut vertices = Vec::new();

    let scale = (
        sprite_scale.0 * atlas_entry.scale,
        sprite_scale.1 * atlas_entry.scale,
    );

    for (index, vertex) in atlas_entry.vertices.chunks_exact(2).enumerate() {
        let x = pos.0 + vertex[0] * scale.0 - scale.0 / 2.0;
        let y = pos.1 + vertex[1] * scale.1;
        let z = sprite_z.0 + (sprite_z.1 - sprite_z.0) * vertex[1];

        vertices.push(MapDetailVertex {
            position: [x, y, z],
            texture_coordinates: [
                atlas_entry.texture_coordinates[index * 2 + 0],
                atlas_entry.texture_coordinates[index * 2 + 1],
            ],
            base_color: color_base,
            country_color: color_realm,
            _padding: [0, 0],
        })
    }

    vertices
}
