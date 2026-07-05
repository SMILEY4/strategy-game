import type {RenderCameraData, TileCollection} from "@pages/game/renderer/data/models.ts";
import type {VertexDataResult} from "@modules/rendergraph/nodes/rg-node.transform-vertex-out.ts";
import type {Tile} from "@app/features/game/models/tile.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";

export interface GameGraphWasmApi {
    uploadTiles: (tiles: TileCollection) => void,
    collectChunks: () => { allChunks: boolean }
    cullChunks: (camera: RenderCameraData) => { visibleChunks: boolean }
    buildTileInstances: () => { tileInstances: boolean },
    downloadTileInstances: () => VertexDataResult
}

/**
 * Note: first implementation of some logic in JS, this logic will later be migrated to WASM.
 */
export const gameGraphWasmApiJsImplementation = (): GameGraphWasmApi => {

    let wasmTiles: TileCollection = {tiles: [], revId: "-"};
    const chunks = new Map<string, { q: number, r: number, tiles: Tile[] }>();
    const visibleChunks = new Set<string>;
    let instances: VertexDataResult = {
        data: new ArrayBuffer(0),
        count: 0,
    };

    return {

        uploadTiles: (tiles: TileCollection) => {
            wasmTiles = {
                tiles: [...tiles.tiles],
                revId: tiles.revId,
            };
        },

        collectChunks: () => {
            chunks.clear();

            for (let i = 0, n = wasmTiles.tiles.length; i < n; i++) {
                const tile = wasmTiles.tiles[i];
                const chunkKey = `${tile.chunk.q}/${tile.chunk.r}`;
                if (!chunks.has(chunkKey)) {
                    chunks.set(chunkKey, {q: tile.chunk.q, r: tile.chunk.r, tiles: [tile]});
                } else {
                    chunks.get(chunkKey)?.tiles.push(tile);
                }
            }

            return {allChunks: true};
        },

        cullChunks: (_camera: RenderCameraData) => {
            visibleChunks.clear();
            chunks.forEach((_value, key: string) => {
                visibleChunks.add(key);
            });
            return {visibleChunks: true};
        },

        buildTileInstances: () => {

            let tileCount = 0;
            visibleChunks.forEach(visibleChunkKey => {
                const chunk = chunks.get(visibleChunkKey);
                if(chunk) {
                    tileCount += chunk.tiles.length
                }
            })

            const buffer = new ArrayBuffer(tileCount * 4 * GlAttributeType.FLOAT.bytes);
            const view = new DataView(buffer);
            let viewCounter = 0;

            function pushFloat32(value: number) {
                view.setFloat32(viewCounter, value, true);
                viewCounter += GlAttributeType.FLOAT.bytes;
            }

            visibleChunks.forEach(visibleChunkKey => {
                const chunk = chunks.get(visibleChunkKey);
                if(!chunk || !chunk.tiles) return
                for (let i = 0, n=chunk.tiles.length; i < n; i++) {
                    const tile = chunk.tiles[i]
                    pushFloat32(tile.position.q)
                    pushFloat32(tile.position.r)
                    pushFloat32(tile.chunk.q)
                    pushFloat32(tile.chunk.r)
                }
            })

            instances = {
                data: buffer,
                count: tileCount
            }


            return { tileInstances: true }
        },

        downloadTileInstances: () => {
            return instances;
        },

    };

};