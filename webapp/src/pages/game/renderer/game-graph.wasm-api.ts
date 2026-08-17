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

export interface GameGraphWasmApi {
    configureRenderer: () => Promise<void>,
    uploadTiles: (tiles: Tile[]) => void,
    uploadEntities: (entities: RenderEntity[]) => void,
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
}

export const gameGraphWasmApiJsImplementation = (): GameGraphWasmApi => {

    const wasmApp: WasmRenderApp = new WasmRenderApp();

    const tileSerializer = wasmSerializer<Tile>({
        "tile_position.q": {
            provider: tile => tile.position.q,
            type: "i32",
        },
        "tile_position.r": {
            provider: tile => tile.position.r,
            type: "i32",
        },
        "chunk_position.q": {
            provider: tile => tile.position.chunkQ,
            type: "i32",
        },
        "chunk_position.r": {
            provider: tile => tile.position.chunkR,
            type: "i32",
        },
        "visibility": {
            provider: tile => tile.visibility,
            type: "u8",
        },
        "terrain_elevation": {
            provider: tile => tile.world.visible ? (tileElevationSerialisationMapping[tile.world.value.elevation] ?? 0) : 0,
            type: "u8",
        },
        "terrain_biome": {
            provider: tile => tile.world.visible ? (tileBiomeSerialisationMapping[tile.world.value.biome] ?? 0) : 0,
            type: "u8",
        },
        "terrain_feature": {
            provider: tile => tile.world.visible ? (tileFeatureSerialisationMapping[tile.world.value.feature] ?? 0) : 0,
            type: "u8",
        },
        "meta.seed": {
            provider: tile => tile.meta.seed,
            type: "u32",
        },
    });

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
    });

    const entityRenderTypeSerialisationMapping: Record<string, number> = {
        undefined: 0,
        "settlement": 1,
    };

    return {

        configureRenderer: async () => {
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
        },

        uploadTiles: (tiles: Tile[]) => {
            console.log("[wasm-api]: uploading tiles (" + tiles.length + ")");
            const memory = wasmApp.tiles_reserve_memory(tiles.length);
            const buffer = new Uint8Array(wasmMemory.buffer, memory.ptr, memory.len * memory.item_size);
            tileSerializer(buffer, tiles);
            wasmApp.tiles_upload(memory.ptr, memory.len);
        },

        uploadEntities: (entities: RenderEntity[]) => {
            console.log("[wasm-api]: uploading entities (" + entities.length + ")", entities);
            const memory = wasmApp.entities_reserve_memory(entities.length);
            const buffer = new Uint8Array(wasmMemory.buffer, memory.ptr, memory.len * memory.item_size);
            entitySerializer(buffer, entities);
            wasmApp.entities_upload(memory.ptr, memory.len);
        },

        collectChunks: () => {
            const changed = wasmApp.calculate_all_chunks();
            console.log("[wasm-api]: collected chunks", changed);
            return {allChunks: changed};
        },

        cullChunks: () => {
            const changed = wasmApp.calculate_visible_chunks();
            return {visibleChunks: changed};
        },

        buildTileInstances: () => {
            console.log("[wasm-api]: building tile instances");
            const changed = wasmApp.calculate_terrain_tile_instances();
            return {
                tileTerrainInstances: changed,
                tileFogOfWarInstances: changed,
                mapDetailVertices: changed,
            }
        },

        downloadTileLandInstances: () => {
            const data = {
                data: wasmApp.get_terrain_tile_land_instances(),
                count: wasmApp.get_terrain_tile_land_instance_count(),
            };
            console.log("[wasm-api]: downloading tile land instances (" + data.count + ")");
            return data;
        },

        downloadTileWaterInstances: () => {
            const data = {
                data: wasmApp.get_terrain_tile_water_instances(),
                count: wasmApp.get_terrain_tile_water_instance_count(),
            };
            console.log("[wasm-api]: downloading tile water instances (" + data.count + ")");
            return data;
        },

        downloadTileFogOfWarInstances: () => {
            const data = {
                data: wasmApp.get_fog_of_war_tile_instances(),
                count: wasmApp.get_fog_of_war_tile_instances_count(),
            };
            console.log("[wasm-api]: downloading tile FoW instances (" + data.count + ")");
            return data;
        },

        downloadMapDetailVertices: () => {
            const data = {
                data: wasmApp.get_map_detail_vertices(),
                count: wasmApp.get_map_detail_vertex_count(),
            };
            console.log("[wasm-api]: downloading map detail vertices (" + data.count + ")");
            return data;
        },

    };

};