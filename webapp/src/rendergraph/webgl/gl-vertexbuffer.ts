import type {GlDisposable} from "@rendergraph/webgl/gl-disposable.ts";
import {GlError} from "@rendergraph/webgl/gl-error.ts";

/**
 * A webgl data buffer holding vertex data
 */
export class GlVertexBuffer implements GlDisposable {

    /**
     * Create a new empty vertex buffer
     * @param gl the webgl context
     */
    public static createEmpty(gl: WebGL2RenderingContext) {
        const vbo = gl.createBuffer();
        GlError.check(gl, "createBuffer", "creating vertex buffer");
        if (vbo === null) {
            throw new Error("Could not create buffer");
        }
        return new GlVertexBuffer(gl, vbo);
    }

    /**
     * Create a new vertex buffer with the given data
     * @param gl the webgl context
     * @param data the data to load into the buffer
     */
    public static create(gl: WebGL2RenderingContext, data: ArrayBuffer) {
        const buffer = GlVertexBuffer.createEmpty(gl);
        buffer.setData(data, true);
        return buffer;
    }

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLBuffer;

    private constructor(gl: WebGL2RenderingContext, handle: WebGLBuffer) {
        this.gl = gl;
        this.handle = handle;
    }

    /**
     * Bind this vertex buffer
     */
    public bind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.handle);
        GlError.check(this.gl, "bindBuffer", "binding vertex buffer.");
    }

    /**
     * Replace the data in this buffer with the new given data
     * @param data the new data to load into this buffer
     * @param bind to bind the framebuffer. Leave or set false when already bound before calling this function.
     */
    public setData(data: ArrayBuffer, bind?: boolean) {
        if (bind) {
            this.bind();
        }
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
        GlError.check(this.gl, "bufferData", "uploading vertex buffer data");
    }

    public dispose() {
        this.gl.deleteBuffer(this.handle);
        GlError.check(this.gl, "deleteBuffer", "disposing vertex buffer");
    }

}