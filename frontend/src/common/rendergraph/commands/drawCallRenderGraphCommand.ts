import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {Camera} from "../../webgl/camera";
import {GLError} from "../../webgl/glError";
import {VertexMetaInfo} from "../nodes/vertexDescriptorRenderGraphNode";
import {RenderGraphCommand} from "../renderGraphCommand";

export class DrawCallRenderGraphCommand extends RenderGraphCommand {

	private readonly scaling: number;
	private readonly clearColor: number[];
	private readonly enableDepth: boolean;
	private readonly blendFunction: ((gl: WebGL2RenderingContext) => void) | null;
	private readonly renderToTexture: boolean;
	private readonly vertexInfoNames: string[];

	constructor(
		scaling: number,
		clearColor: number[],
		enableDepth: boolean,
		blendFunction: ((gl: WebGL2RenderingContext) => void) | null,
		renderToTexture: boolean,
		vertexInfoNames: string[],
	) {
		super();
		this.scaling = scaling;
		this.clearColor = clearColor;
		this.enableDepth = enableDepth;
		this.blendFunction = blendFunction;
		this.renderToTexture = renderToTexture;
		this.vertexInfoNames = vertexInfoNames;
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const gl = resourceManager.getResource<WebGL2RenderingContext>(RenderGraphKeys.gl());
		const camera = resourceManager.getResource<Camera>(RenderGraphKeys.camera());
		const entryCounts = this.getEntryCount(resourceManager);

		// todo: split into multiple commands ?
		//  - init viewport command
		//  - clear screen command
		//  - init depth command
		//  - init blending command

		// viewport
		gl.viewport(0, 0, camera.getWidth() * this.scaling, camera.getHeight() * this.scaling);

		// clear buffers
		gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], this.clearColor[3]);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// depth testing
		if (this.enableDepth) {
			gl.depthRange(0, 1);
			gl.depthMask(true);
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LESS);
		} else {
			gl.disable(gl.DEPTH_TEST);
		}

		// blending
		gl.enable(gl.BLEND);
		if (this.blendFunction == null) {
			gl.blendEquation(gl.FUNC_ADD);
			if (this.renderToTexture) {
				gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			} else {
				gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			}
		} else {
			this.blendFunction(gl);
		}

		// check errors in draw call setup
		GLError.check(gl, "[gl-setup]", "preparing current frame");

		if (entryCounts.instanceCount === null) {
			if (entryCounts.vertexCount === 0) {
				console.warn("called draw with 0 vertexCount count");
			}
			gl.drawArrays(
				gl.TRIANGLES,
				0,
				entryCounts.vertexCount,
			);
			GLError.check(gl, "drawArrays", "drawing");

		} else {

			if (entryCounts.vertexCount === 0 || entryCounts.instanceCount === 0) {
				console.warn("called drawInstances with 0 vertex or instance count");
			}
			gl.drawArraysInstanced(
				gl.TRIANGLES,
				0,
				entryCounts.vertexCount,
				entryCounts.instanceCount,
			);
			GLError.check(gl, "drawArraysInstanced", "drawing instanced");
		}

	}

	private getEntryCount(resourceManager: RenderGraphResourceManager): {
		vertexCount: number;
		instanceCount: number | null
	} {
		const infos = this.vertexInfoNames.map(it => resourceManager.getResource<VertexMetaInfo>(it));
		return {
			vertexCount: infos.find(it => it.type === "vertices")?.entryCount ?? 0,
			instanceCount: infos.find(it => it.type === "instances")?.entryCount ?? null,
		};
	}

	getDebugData(): object {
		return {
			command: "DrawCall",
		};
	}
}