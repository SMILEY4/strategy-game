import {
	VertexGeneratorResult,
} from "../../common/rendergraph/nodes/vertexGeneratorRenderGraphNode";
import {MixedArrayBuffer, MixedArrayBufferType} from "../../common/webgl/mixedArrayBuffer";
import {buildMap} from "../../common/utils";

export namespace FullscreenQuadVertexGenerator {

	export const OUTPUT_ID = "fullscreen-quad.mesh";

	const VERTEX_COUNT = 6;

	const PATTERN = [
		// position (x,y) in range [-1,+1]
		...MixedArrayBufferType.VEC2,
	];


	export function func(): Map<string, VertexGeneratorResult> {
		const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(VERTEX_COUNT, PATTERN);

		// corner a, triangle a
		cursor.push(-1);
		cursor.push(-1);

		// corner b, triangle a
		cursor.push(+1);
		cursor.push(-1);

		// corner c, triangle a
		cursor.push(+1);
		cursor.push(+1);

		// corner a, triangle b
		cursor.push(-1);
		cursor.push(-1);

		// corner d, triangle b
		cursor.push(-1);
		cursor.push(+1);

		// corner c, triangle b
		cursor.push(+1);
		cursor.push(+1);

		return buildMap([
			[
				OUTPUT_ID,
				{
					data: arrayBuffer.getRawBuffer(),
					entryCount: VERTEX_COUNT,
				},
			],
		]);
	}

}