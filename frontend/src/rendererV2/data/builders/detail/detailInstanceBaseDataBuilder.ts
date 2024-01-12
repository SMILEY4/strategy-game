import {
    MixedArrayBuffer,
    MixedArrayBufferCursor,
    MixedArrayBufferType,
} from "../../../../shared/webgl/mixedArrayBuffer";
import {TilemapUtils} from "../../../../logic/game/tilemapUtils";
import {TileDatabase} from "../../../../state/tileDatabase";
import {TerrainType} from "../../../../models/terrainType";
import {Tile} from "../../../../models/tile";
import {TerrainResourceType} from "../../../../models/terrainResourceType";

export namespace DetailMeshDataBuilder {

    interface RenderDetail {
        type: number,
        vertexCount: number,
        vertexData: number[]
    }

    const PATTERN_VERTEX = [
        // world position (x,y)
        ...MixedArrayBufferType.VEC2,
        // texture coords (u,v)
        ...MixedArrayBufferType.VEC2,
    ];


    export function build(tileDb: TileDatabase): [number, ArrayBuffer] {

        const [vertexCount, details] = collectDetails(tileDb);

        const [buffer, cursor] = createMixedArray(vertexCount);

        for (let i = 0; i < details.length; i++) {
            const detail = details[i];
            cursor.append(detail.vertexData);
        }

        return [vertexCount, buffer.getRawBuffer()!];
    }


    function createMixedArray(vertexCount: number): [MixedArrayBuffer, MixedArrayBufferCursor] {
        const array = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(vertexCount, PATTERN_VERTEX),
            PATTERN_VERTEX,
        );
        const cursor = new MixedArrayBufferCursor(array);
        return [array, cursor];
    }

    function collectDetails(tileDb: TileDatabase): [number, RenderDetail[]] {
        const details: RenderDetail[] = [];
        let vertexCount = 0;

        const tiles = tileDb.queryMany(TileDatabase.QUERY_ALL, null);
        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];

            const detailTerrain = collectTerrainType(tile);
            if (detailTerrain) {
                details.push(detailTerrain);
                vertexCount += detailTerrain.vertexCount;
            }

        }


        return [vertexCount, details];
    }


    function collectTerrainType(tile: Tile): RenderDetail | null {

        const tilesetCount = 3;
        let tilesetIndex = -1;
        if (tile.basic.terrainType.visible && tile.basic.terrainType.value === TerrainType.MOUNTAIN) {
            tilesetIndex = 0;
        }
        if (tile.basic.resourceType.visible && tile.basic.resourceType.value === TerrainResourceType.FOREST) {
            tilesetIndex = 1;
        }

        if (tilesetIndex === -1) {
            return null;
        }

        const randomOffsetX = ((Math.random() * 2) - 1) * TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] * 0.25
        const randomOffsetY = ((Math.random() * 2) - 1) * TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] * 0.25

        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.identifier.q, tile.identifier.r);
        center[0] = center[0] + randomOffsetX
        center[1] = center[1] + randomOffsetY

        const scale = 1.0;

        const vertexData: number[] = [

            // triangle a
            center[0],
            center[1],
            ...hexTextureCoordinates(-1, tilesetIndex, tilesetCount),

            hexCornerPointX(0, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[0],
            hexCornerPointY(0, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[1],
            ...hexTextureCoordinates(0, tilesetIndex, tilesetCount),

            hexCornerPointX(1, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[0],
            hexCornerPointY(1, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[1],
            ...hexTextureCoordinates(1, tilesetIndex, tilesetCount),

            // triangle b
            center[0],
            center[1],
            ...hexTextureCoordinates(-1, tilesetIndex, tilesetCount),

            hexCornerPointX(1, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[0],
            hexCornerPointY(1, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[1],
            ...hexTextureCoordinates(1, tilesetIndex, tilesetCount),

            hexCornerPointX(2, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[0],
            hexCornerPointY(2, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[1],
            ...hexTextureCoordinates(2, tilesetIndex, tilesetCount),

            // triangle c
            center[0],
            center[1],
            ...hexTextureCoordinates(-1, tilesetIndex, tilesetCount),

            hexCornerPointX(2, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[0],
            hexCornerPointY(2, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[1],
            ...hexTextureCoordinates(2, tilesetIndex, tilesetCount),

            hexCornerPointX(3, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[0],
            hexCornerPointY(3, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[1],
            ...hexTextureCoordinates(3, tilesetIndex, tilesetCount),

            // triangle c
            center[0],
            center[1],
            ...hexTextureCoordinates(-1, tilesetIndex, tilesetCount),

            hexCornerPointX(3, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[0],
            hexCornerPointY(3, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[1],
            ...hexTextureCoordinates(3, tilesetIndex, tilesetCount),

            hexCornerPointX(4, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[0],
            hexCornerPointY(4, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[1],
            ...hexTextureCoordinates(4, tilesetIndex, tilesetCount),

            // triangle d
            center[0],
            center[1],
            ...hexTextureCoordinates(-1, tilesetIndex, tilesetCount),

            hexCornerPointX(4, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[0],
            hexCornerPointY(4, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[1],
            ...hexTextureCoordinates(4, tilesetIndex, tilesetCount),

            hexCornerPointX(5, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[0],
            hexCornerPointY(5, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[1],
            ...hexTextureCoordinates(5, tilesetIndex, tilesetCount),

            // triangle e
            center[0],
            center[1],
            ...hexTextureCoordinates(-1, tilesetIndex, tilesetCount),

            hexCornerPointX(5, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[0],
            hexCornerPointY(5, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[1],
            ...hexTextureCoordinates(5, tilesetIndex, tilesetCount),

            hexCornerPointX(0, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[0],
            hexCornerPointY(0, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale) + center[1],
            ...hexTextureCoordinates(0, tilesetIndex, tilesetCount),

        ];

        return {
            type: 1,
            vertexCount: 18,
            vertexData: vertexData,
        };
    }


    function hexCornerPointX(cornerIndex: number, size: [number, number], scale: number): number {
        const angleDeg = 60 * cornerIndex - 30;
        const angleRad = Math.PI / 180 * angleDeg;
        return size[0] * Math.cos(angleRad) * scale;
    }

    function hexCornerPointY(cornerIndex: number, size: [number, number], scale: number): number {
        const angleDeg = 60 * cornerIndex - 30;
        const angleRad = Math.PI / 180 * angleDeg;
        return size[1] * Math.sin(angleRad) * scale;
    }

    function hexTextureCoordinates(cornerIndex: number, tilesetIndex: number, tilesetCount: number): [number, number] {
        const xLeft = (0.065 / tilesetCount) + (tilesetIndex / tilesetCount);
        const xCenter = (0.5 / tilesetCount) + (tilesetIndex / tilesetCount);
        const xRight = (0.935 / tilesetCount) + (tilesetIndex / tilesetCount);
        const yBottom = 0;
        const yCenterBottom = 0.25;
        const yCenter = 0.5;
        const yCenterTop = 0.75;
        const yTop = 1;
        switch (cornerIndex) {
            case -1:
                return [xCenter, yCenter];
            case 0:
                return [xRight, yCenterBottom];
            case 1:
                return [xRight, yCenterTop];
            case 2:
                return [xCenter, yTop];
            case 3:
                return [xLeft, yCenterTop];
            case 4:
                return [xLeft, yCenterBottom];
            case 5:
                return [xCenter, yBottom];
            default:
                return [0, 0];
        }
    }

}