import {GLUniformType, GLUniformValueType} from "../../../shared/webgl/glTypes";

export namespace NodeInput {

    export class VertexDescriptor {
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

    export class ClearColor {
        readonly clearColor: [number, number, number, number];

        constructor(props: { clearColor: [number, number, number, number] }) {
            this.clearColor = props.clearColor;
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