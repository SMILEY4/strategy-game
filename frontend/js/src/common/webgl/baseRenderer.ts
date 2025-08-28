import {GLError} from "./glError";
import {Camera} from "./camera";

export class BaseRenderer {

	private readonly gl: WebGL2RenderingContext;

	constructor(gl: WebGL2RenderingContext) {
		this.gl = gl;
	}

	public prepareFrame(camera: Camera, clearColor: [number, number, number, number], blendFunction: ((gl: WebGL2RenderingContext) => void) | null, renderToTexture: boolean, scaling: number, depth: boolean) {
		// viewport
		this.gl.viewport(0, 0, camera.getWidth() * scaling, camera.getHeight() * scaling);

		// clear buffers
		this.gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		// depth testing
		if (depth) {
			this.gl.depthRange(0, 1);
			this.gl.depthMask(true);
			this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.depthFunc(this.gl.LESS);
		} else {
			this.gl.disable(this.gl.DEPTH_TEST);
		}

		// blending
		this.gl.enable(this.gl.BLEND);
		if (blendFunction == null) {
			this.gl.blendEquation(this.gl.FUNC_ADD);
			if (renderToTexture) {
				this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
			} else {
				this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
			}
		} else {
			blendFunction(this.gl)
		}

		// check errors
		GLError.check(this.gl, "[gl-setup]", "preparing current frame");
	}

	public draw(vertexCount: number) {
		if(vertexCount === 0){
			console.warn("called draw with 0 vertexCount count")
		}
		this.gl.drawArrays(
			this.gl.TRIANGLES,
			0,
			vertexCount,
		);
		GLError.check(this.gl, "drawArrays", "drawing");
	}

	public drawIndexed(indexCount: number) {
		if(indexCount === 0){
			console.warn("called drawIndexed with 0 indexCount count")
		}
		this.gl.drawElements(
			this.gl.TRIANGLES,
			indexCount,
			this.gl.UNSIGNED_SHORT,
			0,
		);
		GLError.check(this.gl, "drawElements", "drawing indexed");
	}

	public drawInstanced(vertexCount: number, instanceCount: number) {
		if(vertexCount === 0 || instanceCount === 0){
			console.warn("called drawInstances with 0 vertex or instance count")
		}
		this.gl.drawArraysInstanced(
			this.gl.TRIANGLES,
			0,
			vertexCount,
			instanceCount,
		);
		GLError.check(this.gl, "drawArraysInstanced", "drawing instanced");
	}

}