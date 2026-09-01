import type {VertexDataResult} from "@modules/rendergraph/nodes/rg-node.transform-vertex-out.ts";
import {type SpriteSheetEntry, WasmRenderApp} from "wasm";
import {memory as wasmMemory} from "wasm/wasm_bg.wasm";
import type {Tile} from "@app/features/game/models/tile.ts";
import {wasmSerializer} from "@modules/utilities/wasm-serializer.ts";

import spritesheetMountains from "./spritesheets/mountains.atlas.json";
import spritesheetHills from "./spritesheets/hills.atlas.json";
import spritesheetTrees from "./spritesheets/trees.atlas.json";
import spritesheetBuildings from "./spritesheets/buildings.atlas.json";
import type {RenderEntity} from "@pages/game/renderer/data/models.ts";
import type {MapMode} from "@app/features/game/models/map-mode.ts";
import type {Entity} from "@app/features/game/models/entity.ts";
import {tracer} from "@modules/monitoring/tracer.ts";

export interface GameGraphWasmApi {
    configureRenderer: () => Promise<void>,
    uploadTiles: (tiles: Tile[]) => void,
    uploadEntities: (entities: RenderEntity[]) => void,
    setMapMode: (mapMode: MapMode) => void,
    setSelectedEntityId: (entity: Entity | null) => void,
    buildOverlayInstances: () => {
        overlayFillInstances: boolean,
        overlayEdgeInstances: boolean
    },
    collectChunks: () => { allChunks: boolean }
    cullChunks: () => { visibleChunks: boolean }
    buildTileInstances: () => {
        tileTerrainInstances: boolean,
        tileFogOfWarInstances: boolean,
        mapDetailVertices: boolean
    },
    downloadTileLandInstances: () => VertexDataResult
    downloadTileWaterInstances: () => VertexDataResult
    downloadTileFogOfWarInstances: () => VertexDataResult
    downloadMapDetailVertices: () => VertexDataResult
    downloadOverlayGridInstances: () => VertexDataResult
    downloadOverlayFillInstances: () => VertexDataResult
    downloadOverlayEdgeInstances: () => VertexDataResult
}

export const gameGraphWasmApiJsImplementation = (): GameGraphWasmApi => {

    const wasmApp: WasmRenderApp = new WasmRenderApp();

    type TileUpload = {
        tile: Tile,
        controlOffset: number,
        controlCount: number,
    };

    type ControlUpload = {
        realmId: number,
        entityId: number,
        amount: number,
    };

    const tileSerializer = wasmSerializer<TileUpload>({
        "tile_position.q": {
            provider: tile => tile.tile.position.q,
            type: "i32",
        },
        "tile_position.r": {
            provider: tile => tile.tile.position.r,
            type: "i32",
        },
        "chunk_position.q": {
            provider: tile => tile.tile.position.chunkQ,
            type: "i32",
        },
        "chunk_position.r": {
            provider: tile => tile.tile.position.chunkR,
            type: "i32",
        },
        "visibility": {
            provider: tile => visibilitySerialisationMapping[tile.tile.visibility],
            type: "u8",
        },
        "terrain_elevation": {
            provider: tile => tile.tile.world.visible ? (tileElevationSerialisationMapping[tile.tile.world.value.elevation] ?? 0) : 0,
            type: "u8",
        },
        "terrain_biome": {
            provider: tile => tile.tile.world.visible ? (tileBiomeSerialisationMapping[tile.tile.world.value.biome] ?? 0) : 0,
            type: "u8",
        },
        "terrain_feature": {
            provider: tile => tile.tile.world.visible ? (tileFeatureSerialisationMapping[tile.tile.world.value.feature] ?? 0) : 0,
            type: "u8",
        },
        "meta.seed": {
            provider: tile => tile.tile.meta.seed,
            type: "u32",
        },
        "control_offset": {
            provider: tile => tile.controlOffset,
            type: "u32"
        },
        "control_count": {
            provider: tile => tile.controlCount,
            type: "u32"
        },
        "create_settlement_validity": {
            provider: tile => {
                if(!tile.tile.createSettlement.visible) return 0;
                let validity = 0;
                if(tile.tile.createSettlement.value.validLocation) {
                    validity = 1;
                    if(tile.tile.createSettlement.value.validRealm) {
                        validity = 2;
                    }
                }
                return validity;
            },
            type: "u8"
        }
    });

    const controlSerializer = wasmSerializer<ControlUpload>({
        "realm_id": {provider: control => control.realmId, type: "u32"},
        "entity_id": {provider: control => control.entityId, type: "u32"},
        "amount": {provider: control => control.amount, type: "f32"},
    });

    const visibilitySerialisationMapping: Record<string, number> = {
        undefined: 0,
        "UNDISCOVERED": 0,
        "DISCOVERED": 1,
        "VISIBLE": 2,
    };

    const tileElevationSerialisationMapping: Record<string, number> = {
        undefined: 0,
        "FLAT": 1,
        "HILLS": 2,
        "MOUNTAINS": 3,
    };

    const tileBiomeSerialisationMapping: Record<string, number> = {
        undefined: 0,
        "OCEAN": 1,
        "GRASSLAND": 2,
    };

    const tileFeatureSerialisationMapping: Record<string, number> = {
        undefined: 0,
        "FOREST": 1,
    };

    const entitySerializer = wasmSerializer<RenderEntity>({
        "tile_position.q": {
            provider: entity => entity.position.q,
            type: "i32",
        },
        "tile_position.r": {
            provider: entity => entity.position.r,
            type: "i32",
        },
        "chunk_position.q": {
            provider: entity => entity.position.chunkQ,
            type: "i32",
        },
        "chunk_position.r": {
            provider: entity => entity.position.chunkR,
            type: "i32",
        },
        "render_type": {
            provider: entity => entityRenderTypeSerialisationMapping[entity.renderType],
            type: "u8",
        },
        "is_pending": {
            provider: entity => entity.isPending,
            type: "bool",
        },
    });

    const entityRenderTypeSerialisationMapping: Record<string, number> = {
        undefined: 0,
        "settlement": 1,
    };

    return {

        configureRenderer: async () => {
            tracer.span({name: "wasmapi-configure"}, () => {
                console.log("[wasm-api]: configuring renderer");
                wasmApp.add_spritesheet_entries(1, spritesheetMountains.sprites.map(entry => ({
                    id: entry.id,
                    uvCoords: {
                        uMin: entry.uv.uMin,
                        vMin: entry.uv.vMin,
                        uMax: entry.uv.uMax,
                        vMax: entry.uv.vMax,
                    },
                    nSize: {
                        width: entry.normalized.width,
                        height: entry.normalized.height,
                    },
                    scale: 1.5,
                } satisfies SpriteSheetEntry)));
                wasmApp.add_spritesheet_entries(2, spritesheetHills.sprites.map(entry => ({
                    id: entry.id,
                    uvCoords: {
                        uMin: entry.uv.uMin,
                        vMin: entry.uv.vMin,
                        uMax: entry.uv.uMax,
                        vMax: entry.uv.vMax,
                    },
                    nSize: {
                        width: entry.normalized.width,
                        height: entry.normalized.height,
                    },
                    scale: 1.4,
                } satisfies SpriteSheetEntry)));
                wasmApp.add_spritesheet_entries(3, spritesheetTrees.sprites.map(entry => ({
                    id: entry.id,
                    uvCoords: {
                        uMin: entry.uv.uMin,
                        vMin: entry.uv.vMin,
                        uMax: entry.uv.uMax,
                        vMax: entry.uv.vMax,
                    },
                    nSize: {
                        width: entry.normalized.width,
                        height: entry.normalized.height,
                    },
                    scale: 0.7,
                } satisfies SpriteSheetEntry)));
                wasmApp.add_spritesheet_entries(4, spritesheetBuildings.sprites.map(entry => ({
                    id: entry.id,
                    uvCoords: {
                        uMin: entry.uv.uMin,
                        vMin: entry.uv.vMin,
                        uMax: entry.uv.uMax,
                        vMax: entry.uv.vMax,
                    },
                    nSize: {
                        width: entry.normalized.width,
                        height: entry.normalized.height,
                    },
                    scale: 0.8,
                } satisfies SpriteSheetEntry)));
            });
        },

        uploadTiles: (tiles: Tile[]) => {
            tracer.span({name: "wasmapi-uploadTiles"}, () => {

                console.log("[wasm-api]: uploading tiles (" + tiles.length + ")");

                const controls: ControlUpload[] = [];

                const serializedTiles: TileUpload[] = tiles.map(tile => {
                    const tileControls = tile.political.visible ? tile.political.value.control : [];
                    const controlOffset = controls.length;
                    controls.push(...tileControls.map(control => ({
                        realmId: control.realm,
                        entityId: control.entity,
                        amount: control.amount,
                    })));
                    return {tile, controlOffset, controlCount: tileControls.length};
                });

                const tilesMemory = wasmApp.tiles_reserve_memory(tiles.length);
                const tilesBuffer = new Uint8Array(wasmMemory.buffer, tilesMemory.ptr, tilesMemory.len * tilesMemory.item_size);
                tileSerializer(tilesBuffer, serializedTiles);
                wasmApp.tiles_upload(tilesMemory.ptr, tilesMemory.len);

                const controlsMemory = wasmApp.tile_control_values_reserve_memory(controls.length);
                const controlsBuffer = new Uint8Array(wasmMemory.buffer, controlsMemory.ptr, controlsMemory.len * controlsMemory.item_size);
                controlSerializer(controlsBuffer, controls);
                wasmApp.tile_control_values_upload(controlsMemory.ptr, controlsMemory.len);
            });
        },

        uploadEntities: (entities: RenderEntity[]) => {
            tracer.span({name: "wasmapi-uploadEntities"}, () => {
                console.log("[wasm-api]: uploading entities (" + entities.length + ")", entities);
                const memory = wasmApp.entities_reserve_memory(entities.length);
                const buffer = new Uint8Array(wasmMemory.buffer, memory.ptr, memory.len * memory.item_size);
                entitySerializer(buffer, entities);
                wasmApp.entities_upload(memory.ptr, memory.len);
            });
        },

        setMapMode: (mapMode: MapMode) => {
            tracer.span({name: "wasmapi-setMapMode"}, () => {
                wasmApp.set_map_mode(mapMode.numericId);
            });
        },

        setSelectedEntityId: (entity: Entity | null) => {
            tracer.span({name: "wasmapi-setSelectedEntityId"}, () => {
                wasmApp.set_selected_entity_id(entity ? entity.id : null);
            });
        },

        buildOverlayInstances: () => {
            return tracer.span({name: "wasmapi-buildOverlayInstances"}, () => {
                console.log("[wasm-api]: building overlay instances");
                const changed = wasmApp.build_overlay_instances();
                return {
                    overlayEdgeInstances: changed,
                    overlayFillInstances: changed,
                };
            });
        },

        collectChunks: () => {
            return tracer.span({name: "wasmapi-collectChunks"}, () => {
                const changed = wasmApp.calculate_all_chunks();
                console.log("[wasm-api]: collected chunks", changed);
                return {allChunks: changed};
            });
        },

        cullChunks: () => {
            return tracer.span({name: "wasmapi-cullChunks"}, () => {
                const changed = wasmApp.calculate_visible_chunks();
                return {visibleChunks: changed};
            });
        },

        buildTileInstances: () => {
            return tracer.span({name: "wasmapi-buildTileInstances"}, () => {
                console.log("[wasm-api]: building tile instances");
                const changed = wasmApp.calculate_terrain_tile_instances();
                return {
                    tileTerrainInstances: changed,
                    tileFogOfWarInstances: changed,
                    mapDetailVertices: changed,
                };
            });
        },

        downloadTileLandInstances: () => {
            return tracer.span({name: "wasmapi-downloadTileLandInstances"}, () => {
                const data = {
                    data: wasmApp.get_terrain_tile_land_instances(),
                    count: wasmApp.get_terrain_tile_land_instance_count(),
                };
                console.log("[wasm-api]: downloading tile land instances (" + data.count + ")");
                return data;
            });
        },

        downloadTileWaterInstances: () => {
            return tracer.span({name: "wasmapi-downloadTileWaterInstances"}, () => {
                const data = {
                    data: wasmApp.get_terrain_tile_water_instances(),
                    count: wasmApp.get_terrain_tile_water_instance_count(),
                };
                console.log("[wasm-api]: downloading tile water instances (" + data.count + ")");
                return data;
            });
        },

        downloadTileFogOfWarInstances: () => {
            return tracer.span({name: "wasmapi-downloadTileFogOfWarInstances"}, () => {
                const data = {
                    data: wasmApp.get_fog_of_war_tile_instances(),
                    count: wasmApp.get_fog_of_war_tile_instances_count(),
                };
                console.log("[wasm-api]: downloading tile FoW instances (" + data.count + ")");
                return data;
            });
        },

        downloadMapDetailVertices: () => {
            return tracer.span({name: "wasmapi-downloadMapDetailVertices"}, () => {
                const data = {
                    data: wasmApp.get_map_detail_vertices(),
                    count: wasmApp.get_map_detail_vertex_count(),
                };
                console.log("[wasm-api]: downloading map detail vertices (" + data.count + ")");
                return data;
            });
        },

        downloadOverlayGridInstances: () => {
            return tracer.span({name: "wasmapi-downloadOverlayGridInstances"}, () => {
                const data = {
                    data: wasmApp.get_overlay_grid_instances(),
                    count: wasmApp.get_overlay_grid_instance_count(),
                };
                console.log("[wasm-api]: downloading overlay grid instances (" + data.count + ")");
                return data;
            });
        },

        downloadOverlayFillInstances: () => {
            return tracer.span({name: "wasmapi-downloadOverlayFillInstances"}, () => {
                return {
                    data: wasmApp.get_overlay_fill_instances(),
                    count: wasmApp.get_overlay_fill_instance_count(),
                };
            });
        },

        downloadOverlayEdgeInstances: () => {
            return tracer.span({name: "wasmapi-downloadOverlayEdgeInstances"}, () => {
                return {
                    data: wasmApp.get_overlay_edge_instances(),
                    count: wasmApp.get_overlay_edge_instance_count(),
                };
            });
        },

    };

};
