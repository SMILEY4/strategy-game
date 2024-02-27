import {AbstractRenderNode} from "./abstractRenderNode";
import {GLAttributeComponentAmount, GLAttributeType} from "../../../shared/webgl/glTypes";
import {buildMap} from "../../../shared/utils";

/**
 * A node in the render graph that takes no input and produces/updates vertex-data
 */
export abstract class VertexRenderNode extends AbstractRenderNode {

    public readonly config: VertexRenderNodeConfig;

    constructor(config: VertexRenderNodeConfig) {
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

/**
 * raw vertex buffer
 */
export class VertexBufferResource {
    public readonly data: ArrayBuffer;

    constructor(data: ArrayBuffer) {
        this.data = data;
    }
}

/**
 * The configuration of the node
 */
export interface VertexRenderNodeConfig {
    /**
     * the id of this render node
     */
    id: string,
    /**
     * the configuration for the resulting vertex-data instances
     */
    outputData: VertexDataOutputConfig[]
}

/**
 * The configuration for a single vertex-data output of the node
 */
export interface VertexDataOutputConfig {
    /**
     * the id of the output vertex-data
     */
    id: string,
    /**
     * how the data is rendered
     */
    type: VertexDataType
    /**
     * the configuration and layout of the vertex attributes
     */
    attributes: VertexDataAttributeConfig[]
}

export type VertexDataType = "basic" | "instanced"

/**
 * The configuration for a single vertex attribute
 */
export interface VertexDataAttributeConfig {
    /**
     * the name of the attribute
     */
    name: string,
    /**
     * the data type of the attribute
     */
    type: GLAttributeType,
    /**
     * the name of the source buffer
     */
    origin: string,
    amountComponents: GLAttributeComponentAmount,
    normalized?: boolean,
    stride?: number,
    offset?: number,
    divisor?: number,
}


class MyVertexRenderNode extends VertexRenderNode {

    constructor() {
        super({
            id: "vertexnode.my",
            outputData: [
                {
                    id: "water",
                    type: "basic",
                    attributes: [
                        {
                            origin: "buffer",
                            name: "in_worldPosition",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            origin: "buffer",
                            name: "in_textureCoordinates",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            origin: "buffer",
                            name: "in_visibility",
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                        },
                    ],
                },
                {
                    id: "land",
                    type: "basic",
                    attributes: [
                        {
                            origin: "buffer",
                            name: "in_worldPosition",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            origin: "buffer",
                            name: "in_textureCoordinates",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            origin: "buffer",
                            name: "in_visibility",
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                        },
                    ],
                },
            ],
        });
    }

    public execute(): VertexDataResource {
        return new VertexDataResource({
            buffers: buildMap({
                buffer: new VertexBufferResource(new ArrayBuffer(0)),
            }),
            outputs: buildMap({
                water: {
                    vertexCount: 0,
                    instanceCount: 0,
                },
                land: {
                    vertexCount: 0,
                    instanceCount: 0,
                },
            }),
        });
    }
}