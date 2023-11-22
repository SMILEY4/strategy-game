import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../../shared/webgl/mixedArrayBuffer";
import {TileContainer} from "../../../../models/tileContainer";
import {BorderBuilder} from "../../../../logic/game/borderBuilder";
import {packBorder} from "./packBorder";
import {MapMode} from "../../../../models/mapMode";

export namespace InstanceOverlayDataBuilder {


    const PATTERN_VERTEX = [
        // packed border mask
        MixedArrayBufferType.INT,
        // border color
        ...MixedArrayBufferType.VEC3,
        // fill color
        ...MixedArrayBufferType.VEC3,
    ];

    const VALUES_PER_INSTANCE = PATTERN_VERTEX.length;


    export function build(tileContainer: TileContainer, mapMode: MapMode): [number, ArrayBuffer] {
        const [buffer, cursor] = createMixedArray(tileContainer.getTileCount());
        appendTiles(cursor, tileContainer, mapMode);
        return [tileContainer.getTileCount(), buffer.getRawBuffer()!];
    }


    function createMixedArray(tileCount: number): [MixedArrayBuffer, MixedArrayBufferCursor] {
        const array = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(VALUES_PER_INSTANCE * tileCount, PATTERN_VERTEX),
            PATTERN_VERTEX,
        );
        const cursor = new MixedArrayBufferCursor(array);
        return [array, cursor];
    }


    function appendTiles(cursor: MixedArrayBufferCursor, tileContainer: TileContainer, mapMode: MapMode) {
        const tiles = tileContainer.getTiles();
        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];

            // border mask
            const border = BorderBuilder.build(tile, tileContainer, mapMode.renderData.borderDefault, mapMode.renderData.borderCheck);
            const borderPacked = packBorder(border);
            cursor.append(borderPacked);

            // border color
            cursor.append(mapMode.renderData.borderColor(tile))

            // fill color
            cursor.append(mapMode.renderData.fillColor(tile))
        }
    }


}