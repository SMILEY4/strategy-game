import {GLError} from "./glError";
import {Camera} from "./camera";

export class BaseRenderer {

    private readonly gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    public prepareFrame(camera: Camera, clearColor?: [number, number, number, number], renderToTexture?: boolean) {
        this.gl.viewport(0, 0, camera.getWidth(), camera.getHeight());
        if (clearColor) {
            this.gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
        } else {
            this.gl.clearColor(0, 0, 0, 1);
        }
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendEquation(this.gl.FUNC_ADD);
        if (renderToTexture) {
            this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE);
        } else {
            this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
        }
        GLError.check(this.gl, "[gl-setup]", "preparing current frame");
    }

    public draw(vertexCount: number) {
        this.gl.drawArrays(
            this.gl.TRIANGLES,
            0,
            vertexCount,
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
            instanceCount,
        );
        GLError.check(this.gl, "drawArraysInstanced", "drawing instanced");
    }


}