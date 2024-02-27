import {AbstractRenderNode} from "./abstractRenderNode";
import {GLUniformType, GLUniformValueType} from "../../../shared/webgl/glTypes";

export class DrawRenderNode extends AbstractRenderNode {

    public readonly config: DrawRenderNodeConfig;

    constructor(config: DrawRenderNodeConfig) {
        super(config.id);
        this.config = config;
    }

}

/**
 * The configuration of the node
 */
export interface DrawRenderNodeConfig {
    id: string,
    input: DrawRenderNodeInput.Type[]
    output: DrawRenderNodeOutput.Type[]
}


export namespace DrawRenderNodeInput {

    export type Type = VertexData | Shader | Texture | RenderTarget | Property

    export class VertexData {
        readonly vertexDataId: string;

        constructor(props: { id: string }) {
            this.vertexDataId = props.id;
        }
    }

    export class Shader {
        readonly vertexId: string;
        readonly fragmentId: string;

        constructor(props: { vertexId: string, fragmentId: string }) {
            this.vertexId = props.vertexId;
            this.fragmentId = props.fragmentId;
        }
    }

    export class Texture {
        readonly path: string;
        readonly binding: string;

        constructor(props: { path: string, binding: string }) {
            this.path = props.path;
            this.binding = props.binding;
        }
    }


    export class RenderTarget {
        readonly renderTargetId: string;
        readonly binding: string;

        constructor(props: { renderTargetId: string, binding: string }) {
            this.renderTargetId = props.renderTargetId;
            this.binding = props.binding;
        }
    }

    export class Property {
        readonly valueConstant: GLUniformValueType | null;
        readonly valueProvider: (() => GLUniformValueType) | null;
        readonly type: GLUniformType;
        readonly binding: string;

        constructor(props: {
            valueConstant: GLUniformValueType | null,
            valueProvider: (() => GLUniformValueType) | null,
            type: GLUniformType,
            binding: string
        }) {
            this.valueConstant = props.valueConstant;
            this.valueProvider = props.valueProvider;
            this.type = props.type;
            this.binding = props.binding;
        }
    }

}

export namespace DrawRenderNodeOutput {

    export type Type = RenderTarget | Screen

    export class RenderTarget {
        readonly renderTargetId: string;

        constructor(props: { renderTargetId: string }) {
            this.renderTargetId = props.renderTargetId;
        }
    }

    export class Screen {
    }

}