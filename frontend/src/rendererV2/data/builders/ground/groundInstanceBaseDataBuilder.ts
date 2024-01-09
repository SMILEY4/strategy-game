import {
    MixedArrayBuffer,
    MixedArrayBufferCursor,
    MixedArrayBufferType,
} from "../../../../shared/webgl/mixedArrayBuffer";
import {TileDatabase} from "../../../../state/tileDatabase";
import {TilemapUtils} from "../../../../logic/game/tilemapUtils";

export namespace GroundInstanceBaseDataBuilder {

    const PATTERN_VERTEX = [
        // world position (x,y)
        ...MixedArrayBufferType.VEC2,
        // color (r,g,b)
        ...MixedArrayBufferType.VEC3,
    ];


    export function build(tileDb: TileDatabase): [number, ArrayBuffer] {
        const tileCount = tileDb.count();
        const [buffer, cursor] = createMixedArray(tileCount);
        appendTiles(cursor, tileDb);
        return [tileCount, buffer.getRawBuffer()!];
    }


    function createMixedArray(tileCount: number): [MixedArrayBuffer, MixedArrayBufferCursor] {
        const array = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(tileCount, PATTERN_VERTEX),
            PATTERN_VERTEX,
        );
        const cursor = new MixedArrayBufferCursor(array);
        return [array, cursor];
    }

    export function appendTiles(cursor: MixedArrayBufferCursor, tileDb: TileDatabase) {
        const tiles = tileDb.queryMany(TileDatabase.QUERY_ALL, null);
        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];
            const q = tile.identifier.q;
            const r = tile.identifier.r;

            // world position
            const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
            cursor.append(center[0]);
            cursor.append(center[1]);

            // ground color
            cursor.append(1); // todo: "random" color
            cursor.append(1); // todo: "random" color
            cursor.append(1); // todo: "random" color

        }
    }

}