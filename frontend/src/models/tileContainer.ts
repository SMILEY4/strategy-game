import {Tile} from "./tile";

export class TileContainer {

    private readonly tiles: Tile[];
    private readonly chunkSize: number;
    private readonly chunks: Map<string, TileContainer.Chunk>;

    constructor(tiles: Tile[], chunkSize: number, chunks: Map<string, TileContainer.Chunk>) {
        this.tiles = tiles;
        this.chunkSize = chunkSize;
        this.chunks = chunks;
    }

    public getChunkAt(tileQ: number, tileR: number): TileContainer.Chunk {
        const chunk = this.chunks.get(TileContainer.asChunkKey(tileQ, tileR, this.chunkSize));
        if (chunk) {
            return chunk;
        } else {
            throw new Error("No chunk at tile-position" + tileQ + "," + tileR);
        }
    }

    public getChunkAtOrNull(tileQ: number, tileR: number): TileContainer.Chunk | null {
        const chunk = this.chunks.get(TileContainer.asChunkKey(tileQ, tileR, this.chunkSize));
        if (chunk) {
            return chunk;
        } else {
            return null;
        }
    }

    public getTiles(): Tile[] {
        return this.tiles;
    }

    public getTileAt(q: number, r: number): Tile {
        return this.getChunkAt(q, r).getTileAt(q, r);
    }

    public getTileAtOrNull(q: number, r: number): Tile | null {
        const chunk = this.chunks.get(TileContainer.asChunkKey(q, r, this.chunkSize));
        if (chunk) {
            return chunk.getTileAtOrNull(q, r);
        } else {
            return null;
        }
    }

}


export namespace TileContainer {

    export class Chunk {

        private readonly totalTileCount: number;
        private readonly tiles: Tile[];
        private readonly tileMap: Map<number, Tile>; // todo: maybe as 2d array (only) ?

        constructor(totalTileCount: number, tiles: Tile[], tileMap: Map<number, Tile>) {
            this.totalTileCount= totalTileCount;
            this.tiles = tiles;
            this.tileMap = tileMap;
        }

        public getTiles(): Tile[] {
            return this.tiles;
        }

        public getTileAt(q: number, r: number): Tile {
            const tile = this.tileMap.get(TileContainer.asTileKey(q, r, this.totalTileCount));
            if (tile) {
                return tile;
            } else {
                throw new Error("No tile at " + q + "," + r);
            }
        }

        public getTileAtOrNull(q: number, r: number): Tile | null {
            const tile = this.tileMap.get(TileContainer.asTileKey(q, r, this.totalTileCount));
            if (tile) {
                return tile;
            } else {
                return null;
            }
        }

    }

    export function asTileKey(q: number, r: number, tileCount: number): number {
        return q + r * tileCount;
    }

    export function asChunkKey(q: number, r: number, chunkSize: number): string {
        const chunkQ = getChunkQ(q, r, chunkSize);
        const chunkR = getChunkR(r, chunkSize);
        return "" + chunkQ + "_" + chunkR;
    }

    export function getChunkQ(q: number, r: number, chunkSize: number): number {
        return Math.floor((q + (r / 2)) / chunkSize);
    }

    export function getChunkR(r: number, chunkSize: number): number {
        return Math.floor(r / chunkSize);
    }

    export function create(tiles: Tile[], chunkSize: number): TileContainer {

        const chunkData = new Map<string, Map<number, Tile>>();
        const amountTiles = tiles.length;
        for (let i = 0; i < amountTiles; i++) {
            const tile = tiles[i];
            const chunkKey = asChunkKey(tile.identifier.q, tile.identifier.r, chunkSize);
            const tileKey = asTileKey(tile.identifier.q, tile.identifier.r, amountTiles);
            let chunk = chunkData.get(chunkKey);
            if (!chunk) {
                chunk = new Map<number, Tile>();
                chunkData.set(chunkKey, chunk);
            }
            chunk.set(tileKey, tile);
        }

        const chunks = new Map<string, Chunk>();
        chunkData.forEach((chunk, key) => {
            chunks.set(key, new Chunk(amountTiles, Array.from(chunk.values()), chunk));
        });

        return new TileContainer(tiles, chunkSize, chunks);
    }


}