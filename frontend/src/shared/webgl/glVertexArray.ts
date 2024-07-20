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
        this.gl.bindVertexArray(this.handle);
        GLError.check(this.gl, "bindVertexArray", "binding vertex array object");
    }

    public unbind() {
        GLVertexArray.unbind(this.gl)
    }

    public dispose() {
        this.gl.deleteVertexArray(this.handle);
        GLError.check(this.gl, "deleteVertexArray", "disposing vertex array object");
    }

}


export namespace GLVertexArray {

    export function unbind(gl: WebGL2RenderingContext) {
        gl.bindVertexArray(null);
        GLError.check(gl, "bindVertexArray", "un-binding vertex array object");
    }

    export interface AttributeConfig {
        buffer: GLVertexBuffer;
        location: GLuint,
        type: GLAttributeType,
        amountComponents: GLAttributeComponentAmount,
        normalized?: boolean,
        stride?: number,
        offset?: number,
        divisor?: number,
        debugName?: string
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

        // prepare for attribute configuration
        const buffers = getBuffers(attributes);
        const stride = calculateStridePerBuffer(attributes, buffers);
        const offset = initialOffsets(buffers);

        // configure attributes
        attributes.forEach(attribute => {

            if(attribute.location == -1) {
                console.warn("Vertex attribute has invalid location", attribute.debugName, attribute)
            }

            // enable
            gl.enableVertexAttribArray(attribute.location);
            GLError.check(gl, "enableVertexAttribArray", "enabling attribute " + attribute.location);

            // bind source buffer
            attribute.buffer.bind();

            // set attrib pointers
            if (attribute.type.isInteger) {
                gl.vertexAttribIPointer(
                    attribute.location,
                    attribute.amountComponents,
                    attribute.type.glEnum,
                    isPresent(attribute.stride) ? attribute.stride! : stride.get(attribute.buffer)!,
                    isPresent(attribute.offset) ? attribute.offset! : offset.get(attribute.buffer)!,
                );
                GLError.check(gl, "vertexAttribIPointer");
            } else {
                gl.vertexAttribPointer(
                    attribute.location,
                    attribute.amountComponents,
                    attribute.type.glEnum,
                    isPresent(attribute.normalized) ? attribute.normalized! : false,
                    isPresent(attribute.stride) ? attribute.stride! : stride.get(attribute.buffer)!,
                    isPresent(attribute.offset) ? attribute.offset! : offset.get(attribute.buffer)!,
                );
                GLError.check(gl, "vertexAttribPointer");
            }

            // configure attribute divisor (optional)
            if (attribute.divisor !== undefined) {
                gl.vertexAttribDivisor(attribute.location, attribute.divisor);
            }

            // increment offset
            incrementOffset(offset, attribute.buffer, attribute.type.bytes * attribute.amountComponents)

        });

        // unbind vertex array
        gl.bindVertexArray(null);
        GLError.check(gl, "bindVertexArray", "un-binding vertex array object for creation");
        return new GLVertexArray(gl, vao);
    }


    function getBuffers(attributes: AttributeConfig[]): GLVertexBuffer[] {
        const buffers: GLVertexBuffer[] = [];
        attributes.forEach(attribute => {
            if (buffers.indexOf(attribute.buffer) === -1) {
                buffers.push(attribute.buffer);
            }
        });
        return buffers;
    }

    function initialOffsets(buffers: GLVertexBuffer[]): Map<GLVertexBuffer, number> {
        const map = new Map<GLVertexBuffer, number>();
        buffers.forEach(buffer => {
            map.set(buffer, 0);
        });
        return map;
    }

    function incrementOffset(offsets: Map<GLVertexBuffer, number>, buffer: GLVertexBuffer, increment: number) {
        const newOffset = offsets.get(buffer)! + increment;
        offsets.set(buffer, newOffset);
    }

    function calculateStridePerBuffer(attributes: AttributeConfig[], buffers: GLVertexBuffer[]): Map<GLVertexBuffer, number> {
        const map = new Map<GLVertexBuffer, number>();
        buffers.forEach(buffer => {
            const bufferAttributes = attributes.filter(attribute => attribute.buffer == buffer);
            map.set(buffer, calculateStride(bufferAttributes));
        });
        return map;
    }

    function calculateStride(attributes: AttributeConfig[]): number {
        return attributes
            .map(a => a.amountComponents * a.type.bytes)
            .reduce((a, b) => a + b, 0);
    }


}