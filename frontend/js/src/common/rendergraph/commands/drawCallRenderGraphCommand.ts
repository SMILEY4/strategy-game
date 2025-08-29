import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {GLError} from "../../webgl/glError";
import {RenderGraphCommand} from "../renderGraphCommand";
import {VertexMetaInfo} from "../resources/vertexMetaInfo";

export class DrawCallRenderGraphCommand extends RenderGraphCommand {

	constructor(
		private readonly vertexInfoNames: string[]
	) {
		super();
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const gl = resourceManager.getResource<WebGL2RenderingContext>(RenderGraphKeys.gl());
		const { vertexCount, instanceCount } = this.getEntryCount(resourceManager);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		if (instanceCount === null) {
			// if (vertexCount === 0) {
			// 	console.warn("called draw with 0 vertexCount count");
			// }
			gl.drawArrays(gl.TRIANGLES, 0, vertexCount,);
			GLError.check(gl, "drawArrays", "drawing");

		} else {
			// if (vertexCount === 0 || instanceCount === 0) {
			// 	console.warn("called drawInstances with 0 vertex or instance count");
			// }
			gl.drawArraysInstanced(gl.TRIANGLES, 0, vertexCount, instanceCount,);
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