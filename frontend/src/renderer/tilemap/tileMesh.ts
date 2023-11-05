// noinspection PointlessArithmeticExpressionJS,DuplicatedCode

import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../shared/webgl/mixedArrayBuffer";
import {GLVertexArray} from "../../shared/webgl/glVertexArray";
import {GLAttributeType} from "../../shared/webgl/glTypes";
import {GLVertexBuffer} from "../../shared/webgl/glVertexBuffer";
import {GLProgram} from "../../shared/webgl/glProgram";
import {GLDisposable} from "../../shared/webgl/glDisposable";
import {TilemapUtils} from "../../logic/game/tilemapUtils";
import GLProgramAttribute = GLProgram.GLProgramAttribute;

export interface TileMesh {
    vertexCount: number,
    vertexArray: GLVertexArray;
    additionalDisposables: GLDisposable[];
}

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
export namespace TileMesh {

    const PATTERN_VERTEX = [
        // vertex position
        ...MixedArrayBufferType.VEC2,
        // texture coords
        ...MixedArrayBufferType.VEC2,
    ];

    const VERTICES_PER_TILE = 6 * 3; // "6 triangles" * "3 vertices"
    const VALUES_PER_VERTEX = PATTERN_VERTEX.length;


    export function build(gl: WebGL2RenderingContext, shaderAttributes: GLProgramAttribute[]): TileMesh {
        const vertices = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(VERTICES_PER_TILE * VALUES_PER_VERTEX, PATTERN_VERTEX),
            PATTERN_VERTEX,
        );
        const cursorVertices = new MixedArrayBufferCursor(vertices);

        appendVertices(cursorVertices);

        const vertexBuffer = GLVertexBuffer.create(gl, vertices.getRawBuffer()!);
        return {
            vertexCount: VERTICES_PER_TILE,
            vertexArray: GLVertexArray.create(
                gl,
                [
                    {
                        buffer: vertexBuffer,
                        location: shaderAttributes.find(a => a.name === "in_vertexPosition")!.location,
                        type: GLAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        buffer: vertexBuffer,
                        location: shaderAttributes.find(a => a.name === "in_textureCoordinates")!.location,
                        type: GLAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                ],
                undefined,
            ),
            additionalDisposables: [vertexBuffer],
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
        // corner a
        cursor.append(hexCornerPointX(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size));
        cursor.append(hexCornerPointY(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size));
        cursor.append(hexTextureCoordinates(cornerIndexA));
        // corner b
        cursor.append(hexCornerPointX(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size));
        cursor.append(hexCornerPointY(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size));
        cursor.append(hexTextureCoordinates(cornerIndexB));
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
        const x1 = 0;
        const x2 = 0.5;
        const x3 = 1;
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