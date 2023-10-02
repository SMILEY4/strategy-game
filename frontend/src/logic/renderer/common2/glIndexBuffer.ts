import {GLError} from "./glError";
import {GLDisposable} from "./glDisposable";

export class GLIndexBuffer implements GLDisposable {

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLBuffer;
    private readonly size: number;

    constructor(gl: WebGL2RenderingContext, handle: WebGLBuffer, size: number) {
        this.gl = gl;
        this.handle = handle;
        this.size = size;
    }

    public bind() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.handle);
        GLError.check(this.gl, "bindBuffer", "binding index buffer");
    }

    public dispose() {
        this.gl.deleteBuffer(this.handle);
        GLError.check(this.gl, "deleteBuffer", "disposing index buffer");
    }

    public getSize(): number {
        return this.size;
    }

}

export namespace GLIndexBuffer {

    export function create(gl: WebGL2RenderingContext, data: ArrayBuffer, size: number): GLIndexBuffer {
        // create handle
        const buffer = gl.createBuffer();
        GLError.check(gl, "createBuffer", "creating index buffer");
        if (buffer === null) {
            throw new Error("Could not create index buffer.");
        }

        // bind buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        GLError.check(gl, "bindBuffer", "binding index buffer for data upload");

        // upload data
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
        GLError.check(gl, "bufferData", "upload index buffer data");

        return new GLIndexBuffer(gl, buffer, size);
    }

}