// noinspection PointlessArithmeticExpressionJS

import {MeshData} from "../data/meshData";
import {LineCapsButt} from "../../lines/lineCapsButt";
import {LineJoinMiter} from "../../lines/lineJoinMitter";
import {LineMeshCreator} from "../../lines/lineMeshCreator";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../common/mixedArrayBuffer";
import {LineMesh} from "../../lines/lineMesh";
import {GLAttributeType} from "../../common/glTypes";
import {GLProgram} from "../../common/glProgram";

export namespace LineDataBuilder {

    import GLProgramAttribute = GLProgram.GLProgramAttribute;
    const THICKNESS = 1;

    const PATTERN_INDEX = [
        MixedArrayBufferType.U_SHORT,
    ];

    const PATTERN_VERTEX = [
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.FLOAT,
    ];

    export function build(gl: WebGL2RenderingContext, lines: number[][][], shaderAttributes: GLProgramAttribute[]): MeshData {

        const [triangleCount, vertexCount, lineMeshes] = buildLineMeshes(lines);

        const indices = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(triangleCount * 3, PATTERN_INDEX),
            PATTERN_INDEX,
        );
        const vertices = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(vertexCount * PATTERN_VERTEX.length, PATTERN_VERTEX),
            PATTERN_VERTEX,
        );
        const cursorIndices = new MixedArrayBufferCursor(indices);
        const cursorVertices = new MixedArrayBufferCursor(vertices);

        let indexOffset = 0;
        lineMeshes.forEach(lineMesh => {
            lineMesh.triangles.forEach(triangle => {
                cursorIndices.append(triangle[0] + indexOffset);
                cursorIndices.append(triangle[1] + indexOffset);
                cursorIndices.append(triangle[2] + indexOffset);
            });
            lineMesh.vertices.forEach(vertex => {
                cursorVertices.append(vertex);
            });
            indexOffset += lineMesh.vertices.length;
        });

        return MeshData.create(gl,
            indices,
            vertices,
            triangleCount * 3,
            (vertexBuffer) => [
                {
                    buffer: vertexBuffer,
                    location: shaderAttributes.find(a => a.name === "in_worldPosition")!.location,
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
        );

    }


    function buildLineMeshes(lines: number[][][]): [number, number, LineMesh[]] {
        const lineMeshCreator = new LineMeshCreator();
        const lineMeshes: LineMesh[] = [];
        let triangleCount = 0;
        let vertexCount = 0;
        for (let i = 0; i < lines.length; i++) {
            const mesh = lineMeshCreator.create({
                points: lines[i],
                thickness: THICKNESS,
                capStartFunction: LineCapsButt.start,
                capEndFunction: LineCapsButt.end,
                joinFunction: LineJoinMiter.join,
                vertexBuilder: (currentPoint: number[], currentIndex: number, vertexData: number[]) => vertexData,
            });
            lineMeshes.push(mesh);
            triangleCount += mesh.triangles.length;
            vertexCount += mesh.vertices.length;
        }
        return [triangleCount, vertexCount, lineMeshes];
    }


}