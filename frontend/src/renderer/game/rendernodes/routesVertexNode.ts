import {
    EMPTY_VERTEX_DATA_RESOURCE,
    VertexBufferResource,
    VertexDataResource,
    VertexRenderNode,
} from "../../core/graph/vertexRenderNode";
import {MixedArrayBuffer, MixedArrayBufferType} from "../../../shared/webgl/mixedArrayBuffer";
import {GLAttributeType} from "../../../shared/webgl/glTypes";
import {LineMesh} from "../../../shared/webgl/lines/lineMesh";
import {LineMeshCreator} from "../../../shared/webgl/lines/lineMeshCreator";
import {LineCapsButt} from "../../../shared/webgl/lines/lineCapsButt";
import {LineJoinMiter} from "../../../shared/webgl/lines/lineJoinMitter";
import {buildMap} from "../../../shared/utils";
import {NodeOutput} from "../../core/graph/nodeOutput";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;
import {ChangeProvider} from "../changeProvider";

export class RoutesVertexNode extends VertexRenderNode {

    public static readonly ID = "vertexbuffer.routes"

    private static readonly THICKNESS = 1.0;

    private static readonly PATTERN = [
        // vertex position
        ...MixedArrayBufferType.VEC2,
        // texture coords
        ...MixedArrayBufferType.VEC2,
        // line coords
        ...MixedArrayBufferType.VEC2,
    ];

    private readonly changeProvider: ChangeProvider;

    constructor(changeProvider: ChangeProvider) {
        super({
            id: RoutesVertexNode.ID,
            input: [],
            output: [
                new VertexBuffer({
                    name: "vertexbuffer.routes",
                    attributes: [
                        {
                            name: "in_worldPosition",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            name: "in_textureCoordinates",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            name: "in_lineCoordinates",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                    ],
                }),
                new VertexDescriptor({
                    name: "vertexdata.routes",
                    type: "standart",
                    buffers: ["vertexbuffer.routes"],
                }),
            ],
        });
        this.changeProvider = changeProvider;
    }

    public execute(): VertexDataResource {
        if(!this.changeProvider.hasChange(this.id)) {
            return EMPTY_VERTEX_DATA_RESOURCE;
        }

        const lines: number[][][] = [] // todo this.toLines(this.routeDb.queryMany(RouteDatabase.QUERY_ALL, null));
        const [triangleCount, _, lineMeshes] = this.buildLineMeshes(lines);

        const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(triangleCount * 3, RoutesVertexNode.PATTERN);
        for (let i = 0, n = lineMeshes.length; i < n; i++) {
            const mesh = lineMeshes[i];
            for (let j = 0, m = mesh.triangles.length; j < m; j++) {
                const triangle = mesh.triangles[j];
                cursor.append(mesh.vertices[triangle[0]]);
                cursor.append(mesh.vertices[triangle[1]]);
                cursor.append(mesh.vertices[triangle[2]]);
            }
        }

        return new VertexDataResource({
            buffers: buildMap({
                "vertexbuffer.routes": new VertexBufferResource(arrayBuffer.getRawBuffer()),
            }),
            outputs: buildMap({
                "vertexdata.routes": {
                    vertexCount: triangleCount * 3,
                    instanceCount: 0,
                },
            }),
        });
    }

    private buildLineMeshes(lines: number[][][]): [number, number, LineMesh[]] {

        const lineMeshCreator = new LineMeshCreator();
        const lineMeshes: LineMesh[] = [];
        let triangleCount = 0;
        let vertexCount = 0;
        for (let i = 0; i < lines.length; i++) {
            const lineLength = this.calculateTotalLength(lines[i]);
            const mesh = lineMeshCreator.create({
                points: lines[i],
                thickness: RoutesVertexNode.THICKNESS,
                capStartFunction: LineCapsButt.start,
                capEndFunction: LineCapsButt.end,
                joinFunction: LineJoinMiter.join,
                vertexBuilder: (currentPoint: number[], currentIndex: number, vertexData: number[]) => [
                    ...vertexData,
                    vertexData[2] * lineLength,
                    vertexData[3] * RoutesVertexNode.THICKNESS,
                ],
            });
            lineMeshes.push(mesh);
            triangleCount += mesh.triangles.length;
            vertexCount += mesh.vertices.length;
        }
        return [triangleCount, vertexCount, lineMeshes];
    }

    private calculateTotalLength(points: number[][]): number {
        let totalLength = 0;
        for (let i = 1; i < points.length; i++) {
            totalLength += this.distance(points[i - 1], points[i]);
        }
        return totalLength;
    }

    private distance(a: number[], b: number[]): number {
        const xa = a[0];
        const ya = a[1];
        const xb = b[0];
        const yb = b[1];
        const dx = xb - xa;
        const dy = yb - ya;
        return Math.sqrt(dx * dx + dy * dy);
    }

}