import {GLError} from "./glError";

export class GLVertexBuffer {

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLBuffer;

    constructor(gl: WebGL2RenderingContext, handle: WebGLBuffer) {
        this.gl = gl;
        this.handle = handle;
    }

    public bind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.handle);
        GLError.check(this.gl, "bindBuffer", "binding vertex buffer.")
    }

}

export namespace GLVertexBuffer {

    export function create(gl: WebGL2RenderingContext, data: ArrayBuffer) {
        // create new buffer handle
        const vbo = gl.createBuffer();
        GLError.check(gl, "createBuffer", "creating vertex buffer")
        if (vbo === null) {
            throw new Error("Could not create buffer");
        }
        // bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        GLError.check(gl, "bindBuffer", "bind vertex buffer for creation")
        // upload data
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        GLError.check(gl, "bufferData", "uploading vertex buffer data")
        return new GLVertexBuffer(gl, vbo);
    }

}