import type {GlDisposable} from "@/modules/rendergraph/webgl/gl-disposable.ts";
import {GlError} from "@/modules/rendergraph/webgl/gl-error.ts";

/**
 * A webgl index buffer
 */
export class GlIndexBuffer implements GlDisposable {

    /**
     * Create a new index buffer
     * @param gl the webgl context
     * @param data the raw index data
     * @param size the size, i.e. number of elements in the buffer
     */
    public static create(gl: WebGL2RenderingContext, data: ArrayBuffer, size: number): GlIndexBuffer {
        // create handle
        const buffer = gl.createBuffer();
        GlError.check(gl, "createBuffer", "creating index buffer");
        if (buffer === null) {
            throw new Error("Could not create index buffer.");
        }

        // bind buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        GlError.check(gl, "bindBuffer", "binding index buffer for data upload");

        // upload data
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
        GlError.check(gl, "bufferData", "upload index buffer data");

        return new GlIndexBuffer(gl, buffer, size);
    }

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLBuffer;
    private readonly size: number;

    private constructor(gl: WebGL2RenderingContext, handle: WebGLBuffer, size: number) {
        this.gl = gl;
        this.handle = handle;
        this.size = size;
    }

    /**
     * Bind this index buffer and make it the active one
     */
    public bind() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.handle);
        GlError.check(this.gl, "bindBuffer", "binding index buffer");
    }

    /**
     * @return the size, i.e. number of elements inside this buffer
     */
    public getSize(): number {
        return this.size;
    }

    public dispose() {
        this.gl.deleteBuffer(this.handle);
        GlError.check(this.gl, "deleteBuffer", "disposing index buffer");
    }


}