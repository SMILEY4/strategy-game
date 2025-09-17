import {VertexGeneratorResult} from "../../common/rendergraph/nodes/vertexGeneratorRenderGraphNode";
import {buildMap} from "../../common/utils";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {WasmGameRenderer} from "../wasmGameRenderer";

export namespace MapDetailsVertexGenerator {

	export const OUTPUT_ID = "mapDetails";

	export function funcWasm(context: RenderGraphNodeContext, wasmGameRenderer: WasmGameRenderer): Map<string, VertexGeneratorResult> {

		wasmGameRenderer.updateDetailVertices();
		const [buffer, count] = wasmGameRenderer.getVerticesDetails()

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