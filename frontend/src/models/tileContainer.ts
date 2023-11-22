import {Tile} from "./tile";


export class TileContainer {

    private readonly tiles: Tile[];
    private readonly tilesById: Map<string, Tile>;
    private readonly chunkSize: number;
    private readonly chunks: Map<string, TileContainer.Chunk>;

    constructor(tiles: Tile[], tilesById: Map<string, Tile>, chunkSize: number, chunks: Map<string, TileContainer.Chunk>) {
        this.tiles = tiles;
        this.chunkSize = chunkSize;
        this.chunks = chunks;
        this.tilesById = tilesById;
    }

    public getChunks(): IterableIterator<TileContainer.Chunk> {
        return this.chunks.values();
    }

    public getChunkByKey(key: string): TileContainer.Chunk {
        const chunk = this.chunks.get(key);
        if (chunk) {
            return chunk;
        } else {
            throw new Error("No chunk with key" + key);
        }
    }

    public getChunkByKeyOrNull(key: string): TileContainer.Chunk | null {
        const chunk = this.chunks.get(key);
        if (chunk) {
            return chunk;
        } else {
            return null;
        }
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

    public getTileCount(): number {
        return this.tiles.length;
    }

    public getTiles(): Tile[] {
        return this.tiles;
    }

    public getTile(id: string): Tile {
        const tile = this.tilesById.get(id);
        if (tile) {
            return tile;
        } else {
            throw new Error("No tile with id" + id);
        }
    }

    public getTileOrNull(id: string): Tile | null {
        const tile = this.tilesById.get(id);
        if (tile) {
            return tile;
        } else {
            return null;
        }
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

        private readonly key: string;
        private readonly chunkQ: number;
        private readonly chunkR: number;
        private readonly totalTileCount: number;
        private readonly tiles: Tile[];
        private readonly tileMap: Map<number, Tile>;

        constructor(key: string, chunkQ: number, chunkR: number, totalTileCount: number, tiles: Tile[], tileMap: Map<number, Tile>) {
            this.key = key;
            this.chunkQ = chunkQ;
            this.chunkR = chunkR;
            this.totalTileCount = totalTileCount;
            this.tiles = tiles;
            this.tileMap = tileMap;
        }

        public getKey(): string {
            return this.key;
        }


        public getChunkQ(): number {
            return this.chunkQ;
        }

        public getChunkR(): number {
            return this.chunkR;
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

        const tilesById = new Map<string, Tile>();

        const chunkData = new Map<string, Map<number, Tile>>();
        const chunkPositions = new Map<string, [number, number]>();

        const amountTiles = tiles.length;
        for (let i = 0; i < amountTiles; i++) {
            const tile = tiles[i];
            tilesById.set(tile.identifier.id, tile);
            const chunkKey = asChunkKey(tile.identifier.q, tile.identifier.r, chunkSize);
            const tileKey = asTileKey(tile.identifier.q, tile.identifier.r, amountTiles);
            let chunk = chunkData.get(chunkKey);
            if (!chunk) {
                chunk = new Map<number, Tile>();
                chunkData.set(chunkKey, chunk);
                chunkPositions.set(chunkKey, [
                    getChunkQ(tile.identifier.q, tile.identifier.r, chunkSize),
                    getChunkR(tile.identifier.r, chunkSize),
                ]);
            }
            chunk.set(tileKey, tile);
        }

        const chunks = new Map<string, Chunk>();
        chunkData.forEach((chunk, key) => {
            const chunkPos = chunkPositions.get(key)!!;
            chunks.set(key, new Chunk(key, chunkPos[0], chunkPos[1], amountTiles, Array.from(chunk.values()), chunk));
        });


        return new TileContainer(tiles, tilesById, chunkSize, chunks);
    }


}