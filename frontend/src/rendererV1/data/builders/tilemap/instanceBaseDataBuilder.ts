import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../../shared/webgl/mixedArrayBuffer";
import {TilemapUtils} from "../../../../logic/game/tilemapUtils";
import {BorderBuilder} from "../../../../logic/game/borderBuilder";
import {packBorder} from "./packBorder";
import {TerrainType} from "../../../../models/terrainType";
import {TileDatabase} from "../../../../state/tileDatabase";
import {getHiddenOrNull} from "../../../../models/hiddenType";

export namespace InstanceBaseDataBuilder {

    const PATTERN_VERTEX = [
        // tile position (q,r)
        ...MixedArrayBufferType.INT_VEC2,
        // world position (x,y)
        ...MixedArrayBufferType.VEC2,
        // tileset index
        MixedArrayBufferType.INT,
        // visibility
        MixedArrayBufferType.INT,
        // packed water border mask
        MixedArrayBufferType.INT,
    ];


    export function build(tileDb: TileDatabase): [number, ArrayBuffer] {
        const tileCount = tileDb.count()
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
            const q = tile.identifier.q
            const r = tile.identifier.r
            const terrainType = getHiddenOrNull(tile.basic.terrainType)

            // tile position
            cursor.append(q);
            cursor.append(r);

            // world position
            const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
            cursor.append(center[0]);
            cursor.append(center[1]);

            // tileset index
            cursor.append(terrainType?.renderId ?? 3)

            // visibility
            cursor.append(tile.visibility.renderId);

            // water border mask
            const border = BorderBuilder.build(tile, tileDb, false, (ta, tb) => {
                const a = getHiddenOrNull(ta.basic.terrainType);
                const b = getHiddenOrNull(tb.basic.terrainType);
                return (!a && !b) ? false : a === TerrainType.WATER && b !== null && a !== b;
            });
            const borderPacked = packBorder(border);
            cursor.append(borderPacked);

        }
    }

}