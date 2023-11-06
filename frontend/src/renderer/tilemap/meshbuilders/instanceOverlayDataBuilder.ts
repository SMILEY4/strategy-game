import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../shared/webgl/mixedArrayBuffer";
import {TileContainer} from "../../../models/tileContainer";
import {bitSet} from "../../../shared/utils";
import {TilemapUtils} from "../../../logic/game/tilemapUtils";
import {BorderBuilder} from "../../../logic/game/borderBuilder";

export namespace InstanceOverlayDataBuilder {


    const PATTERN_VERTEX = [
        // packed border data
        MixedArrayBufferType.INT,
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

            // border data
            // todo: temp
            const border = BorderBuilder.build(tile, tileContainer, false, (ta, tb) => {
                const a = ta.terrainType;
                const b = tb.terrainType;
                return (!a && !b) ? false : (!!a && a !== b);
            });
            const borderPacked = packBorder(border);
            cursor.append(borderPacked);

        }
    }


    function packBorder(data: boolean[]): number {
        let packed = 0;
        data.forEach((value, index) => {
            if (value) {
                packed = bitSet(packed, index);
            }
        });
        return packed;
    }




}