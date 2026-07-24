import type {TileCollection} from "@pages/game/renderer/data/models.ts";
import type {VertexDataResult} from "@modules/rendergraph/nodes/rg-node.transform-vertex-out.ts";
import {WasmRenderApp} from "wasm";
import {memory as wasmMemory} from "wasm/wasm_bg.wasm";


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


    return {

        uploadTiles: (tiles: TileCollection) => {
            console.log("[wasm-api]: uploading tiles (" + tiles.tiles.length + ")")

            const memory = wasmApp.tiles_reserve_memory(tiles.tiles.length);
            const buffer = new Uint8Array(wasmMemory.buffer, memory.ptr, memory.len * memory.item_size)

            const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
            let viewCounter = 0;

            function pushUint8(value: number) {
                dataView.setUint8(viewCounter, value);
                viewCounter += 1;
            }

            function pushInt32(value: number) {
                dataView.setInt32(viewCounter, value, true);
                viewCounter += 4;
            }

            function pushUint32(value: number) {
                dataView.setUint32(viewCounter, value, true);
                viewCounter += 4;
            }

            function pushFloat32(value: number) {
                dataView.setFloat32(viewCounter, value, true);
                viewCounter += 4;
            }

            for(let i=0, n=tiles.tiles.length; i<n; i++) {
                const tile = tiles.tiles[i];

                // pub tile_position: HexPosition,
                pushInt32(tile.position.q)
                pushInt32(tile.position.r)

                // pub chunk_position: HexPosition,
                pushInt32(tile.chunk.q)
                pushInt32(tile.chunk.r)

                // pub world_position: WorldPosition,
                pushFloat32(0)
                pushFloat32(0)

                // pub terrain: u8,
                if(tile.world.biome === "OCEAN") {
                    pushUint8(0)
                } else {
                    pushUint8(1)
                }

                // pub rng_seed: u32
                pushUint32(tile.meta.seed)

            }

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