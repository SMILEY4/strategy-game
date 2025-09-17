import {VertexGeneratorResult} from "../../common/rendergraph/nodes/vertexGeneratorRenderGraphNode";
import {buildMap} from "../../common/utils";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {WasmGameRenderer} from "../wasmGameRenderer";

export namespace OverlayInstancesVertexGenerator {

	export const OUTPUT_ID = "overlay.instances";

	export function funcWasm(context: RenderGraphNodeContext, wasmGameRenderer: WasmGameRenderer): Map<string, VertexGeneratorResult> {

		wasmGameRenderer.updateOverlayTileVertices();
		const [buffer, count] = wasmGameRenderer.getVerticesOverlay()

		return buildMap([
			[
				OUTPUT_ID,
				{
					data: buffer,
					entryCount: count,
				},
			],
		]);
	}

}