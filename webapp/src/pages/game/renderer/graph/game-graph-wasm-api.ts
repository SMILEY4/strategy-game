import type {TileCollection} from "@pages/game/renderer/data/models.ts";
import type {VertexDataResult} from "@modules/rendergraph/nodes/rg-node.transform-vertex-out.ts";
import {WasmRenderApp} from "wasm";
import {memory as wasmMemory} from "wasm/wasm_bg.wasm";
import type {Tile} from "@app/features/game/models/tile.ts";
import {wasmSerializer} from "@modules/utilities/wasm-serializer.ts";


export interface GameGraphWasmApi {
    uploadTiles: (tiles: TileCollection) => void,
    collectChunks: () => { allChunks: boolean }
    cullChunks: () => { visibleChunks: boolean }
    buildTileInstances: () => { tileInstances: boolean },
    downloadTileLandInstances: () => VertexDataResult
    downloadTileWaterInstances: () => VertexDataResult
}

/**
 * Note: first implementation of some logic in JS, this logic will later be migrated to WASM.
 */
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
            provider: tile => tile.chunk.q,
            type: "i32",
        },
        "chunk_position.r": {
            provider: tile => tile.chunk.r,
            type: "i32",
        },
        "world_position.x": {
            provider: () => 0,
            type: "f32",
        },
        "world_position.y": {
            provider: () => 0,
            type: "f32",
        },
        "terrain": {
            provider: tile => tile.world.biome === "OCEAN" ? 0 : 1,
            type: "u8",
        },
        "meta.seed": {
            provider: tile => tile.meta.seed,
            type: "u32",
        },
    });

    return {

        uploadTiles: (tiles: TileCollection) => {
            console.log("[wasm-api]: uploading tiles (" + tiles.tiles.length + ")")
            const memory = wasmApp.tiles_reserve_memory(tiles.tiles.length);
            const buffer = new Uint8Array(wasmMemory.buffer, memory.ptr, memory.len * memory.item_size)
            tileSerializer(buffer, tiles.tiles)
            wasmApp.tiles_upload(memory.ptr, memory.len);
        },

        collectChunks: () => {
            const changed = wasmApp.calculate_all_chunks();
            console.log("[wasm-api]: collected chunks", changed)
            return {allChunks: changed};
        },

        cullChunks: () => {
            const changed = wasmApp.calculate_visible_chunks();
            console.log("[wasm-api]: culled chunks", changed)
            return {visibleChunks: changed};
        },

        buildTileInstances: () => {
            console.log("[wasm-api]: building tile instances")
            const changed = wasmApp.calculate_terrain_tile_instances();
            return {tileInstances: changed};
        },

        downloadTileLandInstances: () => {
            const data = {
                data: wasmApp.get_terrain_tile_land_instances(),
                count: wasmApp.get_terrain_tile_land_instance_count(),
            }
            console.log("[wasm-api]: downloading tile land instances (" + data.count + ")")
            return data;
        },

        downloadTileWaterInstances: () => {
            const data = {
                data: wasmApp.get_terrain_tile_water_instances(),
                count: wasmApp.get_terrain_tile_water_instance_count(),
            }
            console.log("[wasm-api]: downloading tile water instances (" + data.count + ")")
            return data;
        },

    };

};