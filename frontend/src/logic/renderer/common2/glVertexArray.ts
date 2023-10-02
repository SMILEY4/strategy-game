import {GLError} from "./glError";
import {GLVertexBuffer} from "./glVertexBuffer";
import {AttributeComponentAmount, GLAttributeType} from "./glTypes";
import {isPresent} from "../../../shared/utils";

export class GLVertexArray {

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLVertexArrayObject;

    constructor(gl: WebGL2RenderingContext, handle: WebGLVertexArrayObject) {
        this.gl = gl;
        this.handle = handle;
    }
}


export namespace GLVertexArray {

    export interface AttributeConfig {
        buffer: GLVertexBuffer;
        index: GLuint,
        type: GLAttributeType,
        amountComponents: AttributeComponentAmount,
        normalized?: boolean
        stride?: number
        offset?: number
    }

    export function create(gl: WebGL2RenderingContext, attributes: AttributeConfig[]) {
        // create new handle
        const vao = gl.createVertexArray();
        GLError.check(gl, "createVertexArray", "creating vertex array object");
        if (vao === null) {
            throw new Error("Could not create vertex array.");
        }
        // bind vertex array
        gl.bindVertexArray(vao);
        GLError.check(gl, "bindVertexArray", "binding vertex array object for creation");
        // configure attributes
        const stride = calculateStride(attributes);
        attributes.forEach(attribute => {
            attribute.buffer.bind();
            if (attribute.type.isInteger) {
                gl.vertexAttribIPointer(
                    attribute.index,
                    attribute.amountComponents,
                    attribute.type.glEnum,
                    isPresent(attribute.stride) ? attribute.stride! : stride,
                    isPresent(attribute.offset) ? attribute.offset! : 0,
                );
                GLError.check(gl, "vertexAttribIPointer");
            } else {
                gl.vertexAttribPointer(
                    attribute.index,
                    attribute.amountComponents,
                    attribute.type.glEnum,
                    isPresent(attribute.normalized) ? attribute.normalized! : false,
                    isPresent(attribute.stride) ? attribute.stride! : stride,
                    isPresent(attribute.offset) ? attribute.offset! : 0,
                );
                GLError.check(gl, "vertexAttribPointer");
            }
        });
        return new GLVertexArray(gl, vao);
    }

    function calculateStride(attributes: AttributeConfig[]): number {
        return attributes
            .map(a => a.amountComponents * a.type.bytes)
            .reduce((a, b) => a + b, 0);
    }

}