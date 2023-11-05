import {GLError} from "./glError";

export class GLRenderer {

    private readonly gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    public prepareFrame() {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        GLError.check(this.gl, "[gl-setup]", "preparing current frame");
    }

    public draw(vertexCount: number) {
        this.gl.drawArrays(
            this.gl.TRIANGLES,
            0,
            vertexCount
        );
        GLError.check(this.gl, "drawArrays", "drawing");
    }

    public drawIndexed(indexCount: number) {
        this.gl.drawElements(
            this.gl.TRIANGLES,
            indexCount,
            this.gl.UNSIGNED_SHORT,
            0,
        );
        GLError.check(this.gl, "drawElements", "drawing indexed");
    }

    public drawInstanced(vertexCount: number, instanceCount: number) {
        this.gl.drawArraysInstanced(
            this.gl.TRIANGLES,
            0,
            vertexCount,
            instanceCount
        );
        GLError.check(this.gl, "drawArraysInstanced", "drawing instanced");
    }



}