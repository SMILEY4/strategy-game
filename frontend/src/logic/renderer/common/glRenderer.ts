import {GLError} from "./glError";
import {GLIndexBuffer} from "./glIndexBuffer";

export class GLRenderer {

    private readonly gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    prepareFrame() {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        GLError.check(this.gl, "[gl-setup]", "preparing current frame");
    }

    drawMesh(size: number) {
        this.gl.drawElements(
            this.gl.TRIANGLES,
            size,
            this.gl.UNSIGNED_SHORT,
            0,
        );
        GLError.check(this.gl, "drawElements", "drawing mesh");
    }

}