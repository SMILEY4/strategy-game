import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {GLError} from "../../webgl/glError";
import {VertexMetaInfo} from "../nodes/vertexDescriptorRenderGraphNode";
import {RenderGraphCommand} from "../renderGraphCommand";

/**
 * Performs a draw call (and screen clear) using the vertex information with the given name(s).
 */
export class DrawCallRenderGraphCommand extends RenderGraphCommand {

	private readonly vertexInfoNames: string[];

	constructor(vertexInfoNames: string[],) {
		super();
		this.vertexInfoNames = vertexInfoNames;
	}

	execute(resourceManager: RenderGraphResourceManager, forceExecute: boolean): void {
		const gl = resourceManager.getResource<WebGL2RenderingContext>(RenderGraphKeys.gl());
		const entryCounts = this.getEntryCount(resourceManager);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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