import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../../shared/webgl/mixedArrayBuffer";
import {BorderBuilder} from "../../../../logic/game/borderBuilder";
import {packBorder} from "./packBorder";
import {MapMode} from "../../../../models/mapMode";
import {TileDatabase} from "../../../../state/tileDatabase";

export namespace InstanceOverlayDataBuilder {


    const PATTERN_VERTEX = [
        // packed border mask
        MixedArrayBufferType.INT,
        // border color
        ...MixedArrayBufferType.VEC3,
        // fill color
        ...MixedArrayBufferType.VEC3,
    ];


    export function build(tileDb: TileDatabase, mapMode: MapMode): [number, ArrayBuffer] {
        const tileCount = tileDb.count()
        const [buffer, cursor] = createMixedArray(tileCount);
        appendTiles(cursor, tileDb, mapMode);
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


    function appendTiles(cursor: MixedArrayBufferCursor, tileDb: TileDatabase, mapMode: MapMode) {
        const tiles = tileDb.queryMany(TileDatabase.QUERY_ALL, null);
        const mapModeContext = mapMode.renderData.context(tiles)
        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];

            // border mask
            const border = BorderBuilder.build(tile, tileDb, mapMode.renderData.borderDefault, mapMode.renderData.borderCheck);
            const borderPacked = packBorder(border);
            cursor.append(borderPacked);

            // border color
            cursor.append(mapMode.renderData.borderColor(tile, mapModeContext))

            // fill color
            cursor.append(mapMode.renderData.fillColor(tile, mapModeContext))
        }
    }


}