import {GLError} from "./glError";
import {Camera} from "./camera";

export class BaseRenderer {

    private readonly gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    public prepareFrame(camera: Camera, clearColor: [number, number, number, number], renderToTexture: boolean, scaling: number, depth: boolean) {
        // viewport
        this.gl.viewport(0, 0, camera.getWidth()*scaling, camera.getHeight()*scaling);

        // clear buffers
        this.gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // depth testing
        if(depth) {
            this.gl.depthRange(0, 30)
            this.gl.depthMask(true)
            this.gl.enable(this.gl.DEPTH_TEST)
            this.gl.depthFunc(this.gl.LESS)
        }

        // blending
        this.gl.enable(this.gl.BLEND);
        this.gl.blendEquation(this.gl.FUNC_ADD);
        if (renderToTexture) {
            this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
        } else {
            this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
        }

        // check errors
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