import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../../shared/webgl/mixedArrayBuffer";
import {TileContainer} from "../../../../models/tileContainer";
import {BorderBuilder} from "../../../../logic/game/borderBuilder";
import {packBorder} from "./packBorder";

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


    export function build(tileContainer: TileContainer): [number, ArrayBuffer] {
        const [buffer, cursor] = createMixedArray(tileContainer.getTileCount());
        appendTiles(cursor, tileContainer);
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


    function appendTiles(cursor: MixedArrayBufferCursor, tileContainer: TileContainer) {
        const tiles = tileContainer.getTiles();
        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];

            // border mask
            const border = BorderBuilder.build(tile, tileContainer, false, (ta, tb) => {
                const a = ta.owner?.province.id;
                const b = tb.owner?.province.id;
                return (!a && !b) ? false : !!a && a !== b;
            });
            const borderPacked = packBorder(border);
            cursor.append(borderPacked);

            // border color
            if (tile.owner?.province) {
                const color = tile.owner.province.color;
                cursor.append(color.red / 255);
                cursor.append(color.green / 255);
                cursor.append(color.blue / 255);
            } else {
                cursor.append(0);
                cursor.append(0);
                cursor.append(0);
            }

            // fill color
            if (tile.owner?.province) {
                const color = tile.owner.province.color;
                cursor.append(color.red / 255);
                cursor.append(color.green / 255);
                cursor.append(color.blue / 255);
            } else {
                cursor.append(0);
                cursor.append(0);
                cursor.append(0);
            }

        }
    }


}