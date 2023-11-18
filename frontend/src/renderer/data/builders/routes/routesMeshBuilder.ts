import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../../shared/webgl/mixedArrayBuffer";
import {Route} from "../../../../models/route";
import {LineMesh} from "../../../../shared/webgl/lines/lineMesh";
import {LineMeshCreator} from "../../../../shared/webgl/lines/lineMeshCreator";
import {LineCapsButt} from "../../../../shared/webgl/lines/lineCapsButt";
import {LineJoinMiter} from "../../../../shared/webgl/lines/lineJoinMitter";
import {TilemapUtils} from "../../../../logic/game/tilemapUtils";

export namespace RoutesMeshBuilder {

    const THICKNESS = 2.5;

    const PATTERN_VERTEX = [
        // world position
        ...MixedArrayBufferType.VEC2,
        // texture coordinates
        ...MixedArrayBufferType.VEC2,
    ];

    export function build(routes: Route[]): [number, ArrayBuffer] {

        const lines = toLines(routes);
        console.log(lines)

        const [triangleCount, _, lineMeshes] = buildLineMeshes(lines);

        const vertices = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(triangleCount*3 * PATTERN_VERTEX.length, PATTERN_VERTEX),
            PATTERN_VERTEX,
        );
        const cursorVertices = new MixedArrayBufferCursor(vertices);

        lineMeshes.forEach(mesh => {
            mesh.triangles.forEach(triangle => {
                cursorVertices.append(mesh.vertices[triangle[0]]);
                cursorVertices.append(mesh.vertices[triangle[1]]);
                cursorVertices.append(mesh.vertices[triangle[2]]);
            });
        });

        return [triangleCount*3, vertices.getRawBuffer()!];
    }

    function toLines(routes: Route[]): number[][][] {
        return routes.map(route => {
            return route.path.map(tile => {
                return TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.q, tile.r);
            });
        });
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
