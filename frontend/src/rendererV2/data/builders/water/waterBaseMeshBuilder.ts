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
export namespace WaterBaseMeshBuilder {

    const PATTERN_VERTEX = [
        // vertex position
        ...MixedArrayBufferType.VEC2,
        // corner data
        ...MixedArrayBufferType.VEC3,
        // direction data
        MixedArrayBufferType.INT,
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
        // center
        cursor.append(0);
        cursor.append(0);
        cursor.append([1, 0, 0])
        cursor.append(cornerIndexA)
        // corner a
        cursor.append(hexCornerPointX(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size));
        cursor.append(hexCornerPointY(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size));
        cursor.append([0, 1, 0])
        cursor.append(cornerIndexA)
        // corner b
        cursor.append(hexCornerPointX(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size));
        cursor.append(hexCornerPointY(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size));
        cursor.append([0, 0, 1])
        cursor.append(cornerIndexA)
    }


    function hexCornerPointX(cornerIndex: number, size: [number, number]): number {
        const angleDeg = 60 * cornerIndex - 30;
        const angleRad = Math.PI / 180 * angleDeg;
        return size[0] * Math.cos(angleRad);
    }

    function hexCornerPointY(cornerIndex: number, size: [number, number]): number {
        const angleDeg = 60 * cornerIndex - 30;
        const angleRad = Math.PI / 180 * angleDeg;
        return size[1] * Math.sin(angleRad);
    }

}