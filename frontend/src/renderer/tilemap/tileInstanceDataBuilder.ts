import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../shared/webgl/mixedArrayBuffer";
import {Tile} from "../../models/tile";
import {TilemapUtils} from "../../logic/game/tilemapUtils";

export namespace TileInstanceDataBuilder {

    const PATTERN_VERTEX = [
        // world position
        ...MixedArrayBufferType.VEC2,
        // tilset index
        MixedArrayBufferType.INT,
        // visibility
        MixedArrayBufferType.INT,
        // border data
        MixedArrayBufferType.INT,
    ];

    const VALUES_PER_INSTANCE = PATTERN_VERTEX.length;


    export function build(tiles: Tile[]): [number, ArrayBuffer] {
        const [buffer, cursor] = createMixedArray(tiles.length);
        appendTiles(cursor, tiles);
        return [tiles.length, buffer.getRawBuffer()!];
    }


    function createMixedArray(tileCount: number): [MixedArrayBuffer, MixedArrayBufferCursor] {
        const array = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(VALUES_PER_INSTANCE * tileCount, PATTERN_VERTEX),
            PATTERN_VERTEX,
        );
        const cursor = new MixedArrayBufferCursor(array);
        return [array, cursor];
    }

    export function appendTiles(cursor: MixedArrayBufferCursor, tiles: Tile[]) {
        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];

            // world position
            const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.identifier.q, tile.identifier.r);
            cursor.append(center[0]);
            cursor.append(center[1]);

            // tileset index
            cursor.append(toTerrainId(tile));

            // visibility
            cursor.append(toVisibilityId(tile));

            // border data
            cursor.append(45) // 101101
        }
    }


    export function toTerrainId(tile: Tile) {
        switch (tile.terrainType) {
            case "WATER":
                return 0;
            case "LAND":
                return 3;
            case "MOUNTAIN":
                return 2;
            default:
                return 3;
        }
    }

    export function toVisibilityId(tile: Tile) {
        switch (tile.visibility) {
            case "UNKNOWN":
                return 0;
            case "DISCOVERED":
                return 1;
            case "VISIBLE":
                return 2;
        }
    }

}