import {
    MixedArrayBuffer,
    MixedArrayBufferCursor,
    MixedArrayBufferType,
} from "../../../../shared/webgl/mixedArrayBuffer";
import {TileDatabase} from "../../../../state/tileDatabase";
import {TilemapUtils} from "../../../../logic/game/tilemapUtils";
import {TerrainType} from "../../../../models/terrainType";
import {shuffleArray} from "../../../../shared/utils";
import {TilePosition} from "../../../../models/tilePosition";
import {TileVisibility} from "../../../../models/tileVisibility";

export namespace GroundInstanceBaseDataBuilder {

    const PATTERN_VERTEX = [
        // world position (x,y)
        ...MixedArrayBufferType.VEC2,
        // color (r,g,b,a)
        ...MixedArrayBufferType.VEC4,
        // visibility
        MixedArrayBufferType.INT,
    ];

    let cachedIndices: number[] = [];

    const voidTiles = buildVoidTiles(20);

    export function build(tileDb: TileDatabase): [number, ArrayBuffer] {
        const tileCount = tileDb.count() * 2 + voidTiles.length;
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

    function appendTiles(cursor: MixedArrayBufferCursor, tileDb: TileDatabase) {
        const tiles = tileDb.queryMany(TileDatabase.QUERY_ALL, null);

        let indices: number[] = [];
        if (cachedIndices.length === tiles.length) {
            indices = cachedIndices;
        } else {
            for (let i = 0, n = tiles.length; i < n; i++) {
                indices.push(i);
            }
            shuffleArray(indices);
            cachedIndices = indices;
        }

        for (let i = 0, n = indices.length; i < n; i++) {
            const tile = tiles[indices[i]];
            const q = tile.identifier.q;
            const r = tile.identifier.r;

            // world position
            const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
            cursor.append(center[0]);
            cursor.append(center[1]);

            // ground color
            let color = [...mix(COLOR_FOW_LIGHT, COLOR_FOW_DARK, Math.random()), 1];
            if (tile.basic.terrainType.visible) {
                if (tile.basic.terrainType.value === TerrainType.WATER) {
                    color = [0, 0, 0, 0];
                } else {
                    color = [...mix(COLOR_LAND_LIGHT, COLOR_LAND_DARK, Math.random()), 1];
                }
            }
            cursor.append(color[0]);
            cursor.append(color[1]);
            cursor.append(color[2]);
            cursor.append(color[3]);

            // visibility
            if (tile.visibility === TileVisibility.VISIBLE) {
                cursor.append(2);
            } else if (tile.visibility === TileVisibility.DISCOVERED) {
                cursor.append(1);
            } else {
                cursor.append(0);
            }

        }

        for (let i = 0, n = voidTiles.length; i < n; i++) {
            const tile = voidTiles[i];
            const q = tile.q;
            const r = tile.r;

            // world position
            const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
            cursor.append(center[0]);
            cursor.append(center[1]);

            // ground color
            cursor.append(0);
            cursor.append(0);
            cursor.append(0);
            cursor.append(1);

            // visibility
            cursor.append(0);

        }

    }

    function buildVoidTiles(worldSize: number): TilePosition[] {
        const tiles: TilePosition[] = [];

        // top edge
        for (let i = 0; i <= worldSize + 1; i++) {
            tiles.push({
                q: -i,
                r: worldSize + 1,
            });
        }

        // bottom edge
        for (let i = 0; i <= worldSize + 1; i++) {
            tiles.push({
                q: i,
                r: -(worldSize + 1),
            });
        }

        // bottom-right edge
        for (let i = 0; i <= worldSize; i++) {
            tiles.push({
                q: worldSize + 1,
                r: -i,
            });
        }

        // top-left edge
        for (let i = 0; i <= worldSize; i++) {
            tiles.push({
                q: -(worldSize + 1),
                r: i,
            });
        }

        // bottom-left edge
        for (let i = 0; i <= worldSize; i++) {
            const s = worldSize + 1;
            tiles.push({
                q: -i,
                r: -(s - i),
            });
        }

        // top-right edge
        for (let i = 0; i <= worldSize; i++) {
            const s = worldSize + 1;
            tiles.push({
                q: i,
                r: (s - i),
            });
        }

        return tiles;
    }


    const COLOR_LAND_LIGHT: [number, number, number] = [0.561, 0.557, 0.345];
    const COLOR_LAND_DARK: [number, number, number] = [0.447, 0.459, 0.341];

    const COLOR_FOW_LIGHT: [number, number, number] = [0.1, 0.1, 0.1];
    const COLOR_FOW_DARK: [number, number, number] = [0.09, 0.09, 0.09];


    function mix(x: [number, number, number], y: [number, number, number], a: number): [number, number, number] {
        return [
            x[0] * (1 - a) + y[0] * a,
            x[1] * (1 - a) + y[1] * a,
            x[2] * (1 - a) + y[2] * a,
        ];
    }

}