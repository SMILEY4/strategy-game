import {GLError} from "./glError";
import {GLDisposable} from "./glDisposable";

export class GLVertexBuffer implements GLDisposable {

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLBuffer;

    constructor(gl: WebGL2RenderingContext, handle: WebGLBuffer) {
        this.gl = gl;
        this.handle = handle;
    }

    public bind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.handle);
        GLError.check(this.gl, "bindBuffer", "binding vertex buffer.");
    }

    public setData(data: ArrayBuffer, bind?: boolean) {
        if (bind) {
            this.bind();
        }
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
        GLError.check(this.gl, "bufferData", "uploading vertex buffer data");
    }

    public dispose() {
        this.gl.deleteBuffer(this.handle);
        GLError.check(this.gl, "deleteBuffer", "disposing vertex buffer");
    }

}

export namespace GLVertexBuffer {

    export function createEmpty(gl: WebGL2RenderingContext) {
        const vbo = gl.createBuffer();
        GLError.check(gl, "createBuffer", "creating vertex buffer");
        if (vbo === null) {
            throw new Error("Could not create buffer");
        }
        return new GLVertexBuffer(gl, vbo);
    }

    export function create(gl: WebGL2RenderingContext, data: ArrayBuffer) {
        const buffer = createEmpty(gl);
        buffer.setData(data, true);
        return buffer;
    }

}