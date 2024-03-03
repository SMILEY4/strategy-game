import {GLAttributeComponentAmount, GLAttributeType} from "../../../shared/webgl/glTypes";

export namespace NodeOutput {

    export class RenderTarget {
        readonly renderTargetId: string;
        readonly depth: boolean
        readonly scale: number;

        constructor(props: { renderTargetId: string, scale: number, depth: boolean }) {
            this.renderTargetId = props.renderTargetId;
            this.depth = props.depth;
            this.scale = props.scale;
        }
    }

    export class Screen {
    }


    export class VertexBuffer {
        readonly name: string;
        readonly attributes: VertexAttribute[]


        constructor(props: {name: string, attributes: VertexAttribute[]}) {
            this.name = props.name;
            this.attributes = props.attributes;
        }
    }


    export class VertexDescriptor {
        readonly name: string;
        readonly type: "standart" | "instanced";
        readonly buffers: string[]

        constructor(props: {name: string, type: "standart" | "instanced", buffers: string[]}) {
            this.name = props.name;
            this.type = props.type;
            this.buffers = props.buffers;
        }
    }

    /**
     * The configuration for a single vertex attribute
     */
    export interface VertexAttribute {
        name: string,
        type: GLAttributeType,
        amountComponents: GLAttributeComponentAmount,
        normalized?: boolean,
        stride?: number,
        offset?: number,
        divisor?: number,
    }

}