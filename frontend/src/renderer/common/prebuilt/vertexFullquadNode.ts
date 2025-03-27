import {VertexBufferResource, VertexDataResource, VertexRenderNode} from "../graph/vertexRenderNode";
import {GLAttributeType} from "../../../common/webgl/glTypes";
import {MixedArrayBuffer, MixedArrayBufferType} from "../../../common/webgl/mixedArrayBuffer";
import {buildMap} from "../../../common/utils";
import {NodeOutput} from "../graph/nodeOutput";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;
import {GameWebGLRenderContext} from "../../game/gameRenderContext";

export class VertexFullQuadNode extends VertexRenderNode<GameWebGLRenderContext> {

	public static readonly ID = "vertexnode.fullquad";
	public static readonly DATA_ID = "vertexdata.fullquad";

	private static readonly PATTERN = [
		// position (x,y) in range [0,1]
		...MixedArrayBufferType.VEC2,
	];

	constructor() {
		super({
			id: VertexFullQuadNode.ID,
			changeKey: VertexFullQuadNode.ID,
			input: [],
			output: [
				new VertexBuffer({
					name: "vertexbuffer.fullquad",
					attributes: [
						{
							name: "in_position",
							type: GLAttributeType.FLOAT,
							amountComponents: 2,
						},
					],
				}),
				new VertexDescriptor({
					name: VertexFullQuadNode.DATA_ID,
					type: "standart",
					buffers: ["vertexbuffer.fullquad"],
				}),
			],
		});
	}

	public execute(context: GameWebGLRenderContext): VertexDataResource {
		const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(6, VertexFullQuadNode.PATTERN);

		// corner a, triangle a
		cursor.append(-1);
		cursor.append(-1);

		// corner b, triangle a
		cursor.append(+1);
		cursor.append(-1);

		// corner c, triangle a
		cursor.append(+1);
		cursor.append(+1);

		// corner a, triangle b
		cursor.append(-1);
		cursor.append(-1);

		// corner d, triangle b
		cursor.append(-1);
		cursor.append(+1);

		// corner c, triangle b
		cursor.append(+1);
		cursor.append(+1);

		return new VertexDataResource({
			buffers: buildMap({
				"vertexbuffer.fullquad": new VertexBufferResource(arrayBuffer.getRawBuffer()),
			}),
			outputs: buildMap({
				"vertexdata.fullquad": {
					vertexCount: 6,
					instanceCount: 0,
				},
			}),
		});
	}

}