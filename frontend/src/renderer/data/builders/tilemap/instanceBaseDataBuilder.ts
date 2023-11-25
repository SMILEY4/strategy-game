import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../../shared/webgl/mixedArrayBuffer";
import {Tile} from "../../../../models/tile";
import {TilemapUtils} from "../../../../logic/game/tilemapUtils";
import {TileContainer} from "../../../../models/tileContainer";
import {BorderBuilder} from "../../../../logic/game/borderBuilder";
import {packBorder} from "./packBorder";
import {TerrainType} from "../../../../models/terrainType";

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

    export function appendTiles(cursor: MixedArrayBufferCursor, tileContainer: TileContainer) {
        const tiles = tileContainer.getTiles();
        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];

            // tile position
            cursor.append(tile.identifier.q);
            cursor.append(tile.identifier.r);

            // world position
            const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.identifier.q, tile.identifier.r);
            cursor.append(center[0]);
            cursor.append(center[1]);

            // tileset index
            cursor.append(tile.terrainType ? tile.terrainType.renderId : 3);

            // visibility
            cursor.append(tile.visibility.renderId);

            // water border mask
            const border = BorderBuilder.build(tile, tileContainer, false, (ta, tb) => {
                const a = ta.terrainType;
                const b = tb.terrainType;
                return (!a && !b) ? false : a === TerrainType.WATER && b !== null && a !== b;
            });
            const borderPacked = packBorder(border);
            cursor.append(borderPacked);

        }
    }

}