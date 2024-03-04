// noinspection PointlessArithmeticExpressionJS,DuplicatedCode

import {
    MixedArrayBuffer,
    MixedArrayBufferCursor,
    MixedArrayBufferType,
} from "../../../../shared/webgl/mixedArrayBuffer";
import {TilemapUtils} from "../../../../logic/game/tilemapUtils";


/*
Vertices of hex-tiles are constructed as following (with corner index shown):
 -1: center
 0. bottom-right
 1. top-right
 2. top
 3. top-left
 4. bottom-left
 5. bottom
*/
export namespace GroundBaseMeshBuilder {

    const PATTERN_VERTEX = [
        // vertex position
        ...MixedArrayBufferType.VEC2,
        // texture coords
        ...MixedArrayBufferType.VEC2,
    ];

    const VERTICES_PER_TILE = 6 * 3; // "6 triangles" * "3 vertices"


    export function build(): [number, ArrayBuffer] {
        const [vertices, cursor] = createMixedArray();
        appendVertices(cursor);
        return createTileMesh(vertices);
    }

    function createMixedArray(): [MixedArrayBuffer, MixedArrayBufferCursor] {
        const array = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(VERTICES_PER_TILE, PATTERN_VERTEX),
            PATTERN_VERTEX,
        );
        const cursor = new MixedArrayBufferCursor(array);
        return [array, cursor];
    }


    function createTileMesh(vertices: MixedArrayBuffer): [number, ArrayBuffer] {
        return [VERTICES_PER_TILE, vertices.getRawBuffer()];
    }

    function appendVertices(cursor: MixedArrayBufferCursor) {
        appendTriangle(cursor, 0, 1);
        appendTriangle(cursor, 1, 2);
        appendTriangle(cursor, 2, 3);
        appendTriangle(cursor, 3, 4);
        appendTriangle(cursor, 4, 5);
        appendTriangle(cursor, 5, 0);
    }


    function appendTriangle(cursor: MixedArrayBufferCursor, cornerIndexA: number, cornerIndexB: number) {
        const scale = 1.44;
        // center
        cursor.append(0);
        cursor.append(0);
        cursor.append(hexTextureCoordinates(-1));
        // corner a
        cursor.append(hexCornerPointX(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
        cursor.append(hexCornerPointY(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
        cursor.append(hexTextureCoordinates(cornerIndexA));
        // corner b
        cursor.append(hexCornerPointX(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
        cursor.append(hexCornerPointY(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
        cursor.append(hexTextureCoordinates(cornerIndexB));
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

    function hexTextureCoordinates(cornerIndex: number): [number, number] {
        const xLeft = 0.065;
        const xCenter = 0.5;
        const xRight = 0.935;
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