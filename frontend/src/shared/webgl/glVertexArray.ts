import {GLError} from "./glError";
import {GLVertexBuffer} from "./glVertexBuffer";
import {GLAttributeComponentAmount, GLAttributeType} from "./glTypes";
import {isPresent} from "../utils";
import {GLIndexBuffer} from "./glIndexBuffer";
import {GLDisposable} from "./glDisposable";

export class GLVertexArray implements GLDisposable {

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLVertexArrayObject;

    constructor(gl: WebGL2RenderingContext, handle: WebGLVertexArrayObject) {
        this.gl = gl;
        this.handle = handle;
    }

    public bind() {
        this.gl.bindVertexArray(this.handle)
        GLError.check(this.gl, "bindVertexArray", "binding vertex array object")
    }

    public dispose() {
        this.gl.deleteVertexArray(this.handle);
        GLError.check(this.gl, "deleteVertexArray", "disposing vertex array object")
    }

}


export namespace GLVertexArray {

    export interface AttributeConfig {
        buffer: GLVertexBuffer;
        location: GLuint,
        type: GLAttributeType,
        amountComponents: GLAttributeComponentAmount,
        normalized?: boolean
        stride?: number
        offset?: number
    }

    export function create(gl: WebGL2RenderingContext, attributes: AttributeConfig[], indexBuffer?: GLIndexBuffer) {
        // create new handle
        const vao = gl.createVertexArray();
        GLError.check(gl, "createVertexArray", "creating vertex array object");
        if (vao === null) {
            throw new Error("Could not create vertex array.");
        }
        // bind vertex array
        gl.bindVertexArray(vao);
        GLError.check(gl, "bindVertexArray", "binding vertex array object for creation");
        // configure index buffer (optional)
        indexBuffer?.bind();
        // configure attributes
        const stride = calculateStride(attributes);
        let offset = 0;
        attributes.forEach(attribute => {
            attribute.buffer.bind();
            if (attribute.type.isInteger) {
                gl.vertexAttribIPointer(
                    attribute.location,
                    attribute.amountComponents,
                    attribute.type.glEnum,
                    isPresent(attribute.stride) ? attribute.stride! : stride,
                    isPresent(attribute.offset) ? attribute.offset! : offset,
                );
                GLError.check(gl, "vertexAttribIPointer");
            } else {
                gl.vertexAttribPointer(
                    attribute.location,
                    attribute.amountComponents,
                    attribute.type.glEnum,
                    isPresent(attribute.normalized) ? attribute.normalized! : false,
                    isPresent(attribute.stride) ? attribute.stride! : stride,
                    isPresent(attribute.offset) ? attribute.offset! : offset,
                );
                GLError.check(gl, "vertexAttribPointer");
            }
            gl.enableVertexAttribArray(attribute.location);
            GLError.check(gl, "enableVertexAttribArray", "enabling attribute " + attribute.location);

            offset += attribute.type.bytes * attribute.amountComponents;
        });
        // unbind vertex array
        gl.bindVertexArray(null);
        GLError.check(gl, "bindVertexArray", "un-binding vertex array object for creation");
        return new GLVertexArray(gl, vao);
    }

    function calculateStride(attributes: AttributeConfig[]): number {
        return attributes
            .map(a => a.amountComponents * a.type.bytes)
            .reduce((a, b) => a + b, 0);
    }

}