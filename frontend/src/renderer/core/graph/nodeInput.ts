import {GLUniformType, GLUniformValueType} from "../../../shared/webgl/glTypes";

/**
 * Inputs of render nodes
 */
export namespace NodeInput {

    /**
     * Vertex data
     */
    export class VertexDescriptor {
        readonly vertexDataId: string;

        constructor(props: { id: string }) {
            this.vertexDataId = props.id;
        }
    }

    /**
     * Shader program
     */
    export class Shader {
        readonly vertexId: string;
        readonly fragmentId: string;

        constructor(props: { vertexId: string, fragmentId: string }) {
            this.vertexId = props.vertexId;
            this.fragmentId = props.fragmentId;
        }
    }

    /**
     * Texture
     */
    export class Texture {
        readonly path: string;
        readonly binding: string;

        constructor(props: { path: string, binding: string }) {
            this.path = props.path;
            this.binding = props.binding;
        }
    }

    /**
     * Render target (treated as texture)
     */
    export class RenderTarget {
        readonly renderTargetId: string;
        readonly binding: string;

        constructor(props: { renderTargetId: string, binding: string }) {
            this.renderTargetId = props.renderTargetId;
            this.binding = props.binding;
        }
    }

    /**
     * the color to clear the screen/rendertarget with
     */
    export class ClearColor {
        readonly clearColor: [number, number, number, number];

        constructor(props: { clearColor: [number, number, number, number] }) {
            this.clearColor = props.clearColor;
        }
    }

    /**
     * Property, usually accessible in the shader
     */
    export class Property {
        readonly valueConstant: GLUniformValueType | null;
        readonly valueProvider: (() => GLUniformValueType) | null;
        readonly type: GLUniformType;
        readonly binding: string;

        constructor(props: {
            valueConstant?: GLUniformValueType | null,
            valueProvider?: (() => GLUniformValueType) | null,
            type: GLUniformType,
            binding: string
        }) {
            this.valueConstant = props.valueConstant !== undefined ? props.valueConstant : null;
            this.valueProvider = props.valueProvider !== undefined ? props.valueProvider : null;
            this.type = props.type;
            this.binding = props.binding;
        }
    }

}