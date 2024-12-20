import {VertexBufferResource, VertexDataResource, VertexRenderNode} from "../../common/graph/vertexRenderNode";
import {GLAttributeType} from "../../../common/webgl/glTypes";
import {MixedArrayBuffer, MixedArrayBufferType} from "../../../common/webgl/mixedArrayBuffer";
import {buildMap, emptyMap} from "../../../common/utils";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {GameWebGLRenderContext} from "../gameRenderContext";
import {NodeInput} from "../../common/graph/nodeInput";
import {ProvidedNodeInputs} from "../../common/graph/providedNodeInputs";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;
import TextureAtlasData = NodeInput.TextureAtlasData;

interface MapDetailSprite {
	name: string,
	vertices: number[][]
	x: number,
	y: number,
	scale: number,
}

export class MapDetailsVertexNode extends VertexRenderNode<GameWebGLRenderContext> {

	public static readonly ID = "vertexnode.mapdetails";

	private static readonly PATTERN = [
		// vertex position
		...MixedArrayBufferType.VEC2,
		// texture coords
		...MixedArrayBufferType.VEC2,
	];

	constructor() {
		super({
			id: MapDetailsVertexNode.ID,
			changeKey: MapDetailsVertexNode.ID,
			input: [
				new TextureAtlasData({
					path: "/icons/tileset.png",
				}),
			],
			output: [
				new VertexBuffer({
					name: "vertexbuffer.mapdetails",
					attributes: [
						{
							name: "in_worldPosition",
							type: GLAttributeType.FLOAT,
							amountComponents: 2,
						},
						{
							name: "in_textureCoordinates",
							type: GLAttributeType.FLOAT,
							amountComponents: 2,
						},
					],
				}),
				new VertexDescriptor({
					name: "vertexdata.mapdetails",
					type: "standart",
					buffers: ["vertexbuffer.mapdetails"],
				}),
			],
		});
	}

	public execute(context: GameWebGLRenderContext, inputs: ProvidedNodeInputs): VertexDataResource {

		const sprites: MapDetailSprite[] = [];

		// todo collect sprites ...

		let vertexCount = 0;
		sprites.forEach(sprite => { // todo: optimize
			vertexCount += sprite.vertices.length;
		});

		const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(vertexCount, MapDetailsVertexNode.PATTERN);
		sprites.forEach(sprite => {
			sprite.vertices.forEach(vertex => {
				// world position
				cursor.append(vertex[0] * sprite.scale + sprite.x); // todo
				cursor.append(vertex[1] * sprite.scale + sprite.x);
				// texture coordinates
				cursor.append(vertex[0]);
				cursor.append(vertex[1]);
			});
		});

		return new VertexDataResource({
			buffers: buildMap({
				"vertexbuffer.mapdetails": new VertexBufferResource(arrayBuffer.getRawBuffer())
			}),
			outputs: buildMap({
				"vertexdata.mapdetails": {
					vertexCount: vertexCount,
					instanceCount: 0,
				}
			}),
		});
	}

}