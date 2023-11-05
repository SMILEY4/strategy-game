// noinspection PointlessArithmeticExpressionJS,DuplicatedCode

import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../shared/webgl/mixedArrayBuffer";
import {GLVertexBuffer} from "../../shared/webgl/glVertexBuffer";
import {TilemapUtils} from "../../logic/game/tilemapUtils";
import {TilemapRenderData} from "./tilemapRenderData";
import TileMesh = TilemapRenderData.TileMesh;


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
export namespace TileMeshBuilder {

    const PATTERN_VERTEX = [
        // vertex position
        ...MixedArrayBufferType.VEC2,
        // texture coords
        ...MixedArrayBufferType.VEC2,
        // corner data
        ...MixedArrayBufferType.VEC3,
        // direction data
        MixedArrayBufferType.INT,
    ];

    const VERTICES_PER_TILE = 6 * 3; // "6 triangles" * "3 vertices"
    const VALUES_PER_VERTEX = PATTERN_VERTEX.length;


    export function build(gl: WebGL2RenderingContext): TileMesh {
        const [vertices, cursor] = createMixedArray();
        appendVertices(cursor);
        return createTileMesh(gl, vertices);
    }

    function createMixedArray(): [MixedArrayBuffer, MixedArrayBufferCursor] {
        const array = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(VERTICES_PER_TILE * VALUES_PER_VERTEX, PATTERN_VERTEX),
            PATTERN_VERTEX,
        );
        const cursor = new MixedArrayBufferCursor(array);
        return [array, cursor];
    }


    function createTileMesh(gl: WebGL2RenderingContext, vertices: MixedArrayBuffer): TileMesh {
        return {
            vertexCount: VERTICES_PER_TILE,
            vertexBuffer: GLVertexBuffer.create(gl, vertices.getRawBuffer()!),
        };
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
        cursor.append(hexTextureCoordinates(-1));
        cursor.append([1, 0, 0])
        cursor.append(cornerIndexA)
        // corner a
        cursor.append(hexCornerPointX(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size));
        cursor.append(hexCornerPointY(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size));
        cursor.append(hexTextureCoordinates(cornerIndexA));
        cursor.append([0, 1, 0])
        cursor.append(cornerIndexA)
        // corner b
        cursor.append(hexCornerPointX(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size));
        cursor.append(hexCornerPointY(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size));
        cursor.append(hexTextureCoordinates(cornerIndexB));
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

    function hexTextureCoordinates(cornerIndex: number): [number, number] {
        const x1 = 0.065;
        const x2 = 0.5;
        const x3 = 0.935;
        const y1 = 0;
        const y2 = 0.25;
        const y3 = 0.5;
        const y4 = 0.75;
        const y5 = 1;
        switch (cornerIndex) {
            case -1:
                return [x2, y3];
            case 0:
                return [x3, y2];
            case 1:
                return [x3, y4];
            case 2:
                return [x2, y5];
            case 3:
                return [x1, y4];
            case 4:
                return [x1, y2];
            case 5:
                return [x2, y1];
            default:
                return [0, 0];
        }
    }


}