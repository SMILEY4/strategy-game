import {
    MixedArrayBuffer,
    MixedArrayBufferCursor,
    MixedArrayBufferType,
} from "../../../../shared/webgl/mixedArrayBuffer";
import {TileDatabase} from "../../../../state/tileDatabase";
import {TilemapUtils} from "../../../../logic/game/tilemapUtils";
import {TerrainType} from "../../../../models/terrainType";
import {BorderBuilder} from "../../../../logic/game/borderBuilder";
import {getHiddenOrNull} from "../../../../models/hiddenType";
import {packBorder} from "../../../../renderer/data/builders/tilemap/packBorder";

export namespace WaterInstanceBaseDataBuilder {

    const PATTERN_VERTEX = [
        // world position (x,y)
        ...MixedArrayBufferType.VEC2,
        // packed water border mask
        MixedArrayBufferType.INT,
    ];


    export function build(tileDb: TileDatabase): [number, ArrayBuffer] {
        const tileCount = countWaterTiles(tileDb);
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
            if (!tile.basic.terrainType.visible || tile.basic.terrainType.value !== TerrainType.WATER) {
                continue;
            }

            const q = tile.identifier.q;
            const r = tile.identifier.r;

            // world position
            const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
            cursor.append(center[0]);
            cursor.append(center[1]);

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

    function countWaterTiles(tileDb: TileDatabase): number {
        const tiles = tileDb.queryMany(TileDatabase.QUERY_ALL, null);
        let count = 0
        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];
            if (!tile.basic.terrainType.visible || tile.basic.terrainType.value !== TerrainType.WATER) {
                continue;
            }
            count++;
        }
        return count
    }

}