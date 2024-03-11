import {AbstractRenderNode} from "./abstractRenderNode";
import {NodeOutput} from "./nodeOutput";

/**
 * Node in a render node that writes/updates vertex-data
 * Requires as output
 * - n vertex-descriptors and all their associated buffers
 */
export abstract class VertexRenderNode extends AbstractRenderNode {

    public readonly config: VertexRenderNodeConfig;

    protected constructor(config: VertexRenderNodeConfig) {
        super(config.id);
        this.config = config;
    }

    /**
     * Update vertex data each frame
     * @return updated only the updated vertex buffers. Return an empty map to not modify any data.
     * The keys must be defined in the config of this node
     */
    public abstract execute(): VertexDataResource

}

/**
 * The configuration of the node
 */
export interface VertexRenderNodeConfig {
    id: string,
    input: (unknown)[]
    output: (NodeOutput.VertexBuffer | NodeOutput.VertexDescriptor)[]
}

/**
 * The result of the execute-function
 */
export class VertexDataResource {
    public readonly buffers: Map<string, VertexBufferResource>;
    public readonly outputs: Map<string, { vertexCount: number, instanceCount: number }>;

    constructor(params: {
        buffers: Map<string, VertexBufferResource>,
        outputs: Map<string, { vertexCount: number; instanceCount: number }>
    }) {
        this.buffers = params.buffers;
        this.outputs = params.outputs;
    }
}

export const EMPTY_VERTEX_DATA_RESOURCE = new VertexDataResource({
    buffers: new Map<string, VertexBufferResource>,
    outputs: new Map<string, { vertexCount: number; instanceCount: number }>
});

/**
 * raw vertex buffer
 */
export class VertexBufferResource {
    public readonly data: ArrayBuffer;

    constructor(data: ArrayBuffer) {
        this.data = data;
    }
}

