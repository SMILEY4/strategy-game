import {GLError} from "../common2/glError";
import {GLBuffer} from "./glBuffer";
import {isPresent} from "../../../shared/utils";

export enum GLBufferAttributeType {
    BYTE, // 8-bit integer [-128, 127]
    SHORT, // 16-bit integer [-32768, 32767]
    INT, // 32-bit integer
    U_BYTE, // unsigned 8-bit integer [0, 255]
    U_SHORT, // unsigned 16-bit integer [0, 65535]
    U_INT, // unsigned 32-bit integer
    FLOAT, // 32-bit IEEE floating point number
    HALF_FLOAT, // 16-bit IEEE floating point number
}

export interface GLVertexAttribute {
    name: string,
    location: GLint
    type: GLBufferAttributeType,
    amountComponents: 1 | 2 | 3 | 4,
    normalized?: boolean,
    stride?: number,
    offset?: number
}

export class GLVertexArray {

    public static create(gl: WebGL2RenderingContext, attributes: GLVertexAttribute[], data: ArrayBuffer, size: number) {

        const vao = gl.createVertexArray();
        GLError.check(gl, "createVertexArray", "creating vertex array");
        if (vao === null) {
            throw new Error("Could not create vertex array.");
        }

        gl.bindVertexArray(vao);
        GLError.check(gl, "bindVertexArray", "binding vertex array (during creation)");

        GLVertexArray.setupAttributes(gl, attributes);
        GLVertexArray.setData(gl, data);
        return new GLVertexArray(gl, vao, size);
    }

    private static setData(gl: WebGL2RenderingContext, data: ArrayBuffer) {
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        GLError.check(gl, "bufferData", "set vertex array data");
    }

    private static setupAttributes(gl: WebGL2RenderingContext, attributes: GLVertexAttribute[]) {
        const stride = GLVertexArray.calculateStride(attributes);
        let offsetBytes = 0;
        attributes.forEach(attribute => {

            gl.enableVertexAttribArray(attribute.location);
            GLError.check(gl, "enableVertexAttribArray", "");

            if (GLBuffer.attributeTypeIsInteger(attribute.type)) {
                gl.vertexAttribIPointer(
                    attribute.location,
                    attribute.amountComponents,
                    GLBuffer.attributeTypeToGLType(attribute.type),
                    isPresent(attribute.stride) ? attribute.stride! : stride,
                    isPresent(attribute.offset) ? attribute.offset! : 0,
                );
                GLError.check(gl, "vertexAttribIPointer");
            } else {
                gl.vertexAttribPointer(
                    attribute.location,
                    attribute.amountComponents,
                    GLBuffer.attributeTypeToGLType(attribute.type),
                    isPresent(attribute.normalized) ? attribute.normalized! : false,
                    isPresent(attribute.stride) ? attribute.stride! : stride,
                    isPresent(attribute.offset) ? attribute.offset! : 0,
                );
                GLError.check(gl, "vertexAttribIPointer");
            }

            offsetBytes += GLBuffer.attributeTypeToBytes(attribute.type) * attribute.amountComponents;
        });
    }

    private static calculateStride(attributes: GLVertexAttribute[]): number {
        return attributes
            .map(a => a.amountComponents * GLBuffer.attributeTypeToBytes(a.type))
            .reduce((a, b) => a + b, 0);
    }


    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLVertexArrayObject;
    private readonly size: number;

    constructor(gl: WebGL2RenderingContext, handle: WebGLVertexArrayObject, size: number) {
        this.gl = gl;
        this.handle = handle;
        this.size = size;
    }

    public use() {
        this.gl.bindVertexArray(this.handle);
    }

    public dispose() {
        this.gl.deleteVertexArray(this.handle);
    }

}