import {VertexBufferResource, VertexDataResource, VertexRenderNode} from "../graph/vertexRenderNode";
import {GLAttributeType} from "../../../shared/webgl/glTypes";
import {MixedArrayBuffer, MixedArrayBufferType} from "../../../shared/webgl/mixedArrayBuffer";
import {buildMap} from "../../../shared/utils";
import {NodeOutput} from "../graph/nodeOutput";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;

export class VertexFullQuadNode extends VertexRenderNode {

    public static readonly DATA_ID = "vertexdata.fullquad";

    private initialized: boolean = false;

    private static readonly PATTERN = [
        // position (x,y) in range [0,1]
        ...MixedArrayBufferType.VEC2,
    ];

    private static NOOP_RESULT: VertexDataResource = new VertexDataResource({
        buffers: new Map<string, VertexBufferResource>(),
        outputs: new Map<string, { vertexCount: number; instanceCount: number }>(),
    });

    constructor() {
        super({
            id: "vertexnode.fullquad",
            input: [],
            output: [
                new VertexBuffer({
                    name: "vertexbuffer.fullquad",
                    attributes: [
                        {
                            name: "in_position",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                    ],
                }),
                new VertexDescriptor({
                    name: VertexFullQuadNode.DATA_ID,
                    type: "standart",
                    buffers: ["vertexbuffer.fullquad"],
                }),
            ],
        });
    }

    public execute(): VertexDataResource {
        if (!this.initialized) {
            this.initialized = true;
            const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(6, VertexFullQuadNode.PATTERN);
            // corner a, triangle a
            cursor.append(-1);
            cursor.append(-1);
            // corner b, triangle a
            cursor.append(+1);
            cursor.append(-1);
            // corner c, triangle a
            cursor.append(+1);
            cursor.append(+1);
            // corner a, triangle b
            cursor.append(-1);
            cursor.append(-1);
            // corner d, triangle b
            cursor.append(-1);
            cursor.append(+1);
            // corner c, triangle b
            cursor.append(+1);
            cursor.append(+1);

            return new VertexDataResource({
                buffers: buildMap({
                    "vertexbuffer.fullquad": new VertexBufferResource(arrayBuffer.getRawBuffer()),
                }),
                outputs: buildMap({
                    "vertexdata.fullquad": {
                        vertexCount: 6,
                        instanceCount: 0,
                    },
                }),
            });

        } else {
            return VertexFullQuadNode.NOOP_RESULT;
        }
    }

}