import {VertexBufferResource, VertexDataResource, VertexRenderNode} from "../../common/graph/vertexRenderNode";
import {GLAttributeType} from "../../../common/webgl/glTypes";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../common/webgl/mixedArrayBuffer";
import {TilemapUtils} from "../../../common/tilemapUtils";
import {buildMap} from "../../../common/utils";
import {NodeOutput} from "../../common/graph/nodeOutput";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;
import {GameWebGLRenderContext} from "../gameRenderContext";

interface RenderEntity {
	q: number,
	r: number,
	type: "city" | "scout" | "marker"
}

export class EntitiesVertexNode extends VertexRenderNode<GameWebGLRenderContext> {

	public static readonly ID = "vertexnode.entities";

	private static readonly PATTERN = [
		// vertex position
		...MixedArrayBufferType.VEC2,
		// texture coords
		...MixedArrayBufferType.VEC2,
	];

	constructor() {
		super({
			id: EntitiesVertexNode.ID,
			changeKey: EntitiesVertexNode.ID,
			input: [],
			output: [
				new VertexBuffer({
					name: "vertexbuffer.entities",
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
					name: "vertexdata.entities",
					type: "standart",
					buffers: ["vertexbuffer.entities"],
				}),
			],
		});
	}

	public execute(context: GameWebGLRenderContext): VertexDataResource {

		const renderEntities = this.collectEntities(context);

		const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(renderEntities.length * 6, EntitiesVertexNode.PATTERN);
		for (let i = 0; i < renderEntities.length; i++) {
			this.appendEntity(renderEntities[i], cursor);
		}

		return new VertexDataResource({
			buffers: buildMap({
				"vertexbuffer.entities": new VertexBufferResource(arrayBuffer.getRawBuffer()),
			}),
			outputs: buildMap({
				"vertexdata.entities": {
					vertexCount: renderEntities.length * 6,
					instanceCount: 0,
				},
			}),
		});
	}

	private collectEntities(context: GameWebGLRenderContext): RenderEntity[] {

		const entities: RenderEntity[] = [];

		const settlements = context.settlements;
		for (let i = 0, n = settlements.length; i < n; i++) {
			const settlement = settlements[i];
			entities.push({
				q: settlement.tile.q,
				r: settlement.tile.r,
				type: "city",
			});
		}

		return entities;
	}

	private appendEntity(entity: RenderEntity, cursor: MixedArrayBufferCursor) {

		const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, entity.q, entity.r);
		const halfSize = TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] * 1.15;
		const texU = this.texU(entity);


		// triangle a
		this.appendVertex(center[0] - halfSize, center[1] - halfSize, texU[0], 0, cursor);
		this.appendVertex(center[0] + halfSize, center[1] - halfSize, texU[1], 0, cursor);
		this.appendVertex(center[0] + halfSize, center[1] + halfSize, texU[1], 1, cursor);

		// triangle b
		this.appendVertex(center[0] - halfSize, center[1] - halfSize, texU[0], 0, cursor);
		this.appendVertex(center[0] - halfSize, center[1] + halfSize, texU[0], 1, cursor);
		this.appendVertex(center[0] + halfSize, center[1] + halfSize, texU[1], 1, cursor);
	}

	private appendVertex(x: number, y: number, u: number, v: number, cursor: MixedArrayBufferCursor) {

		// world position
		cursor.append(x);
		cursor.append(y);

		// texture coordinates
		cursor.append(u);
		cursor.append(v);
	}

	private texU(entity: RenderEntity): [number, number] {
		const step = 1 / 8; // todo: load from texture atlas
		if (entity.type === "city") {
			return [step * 4, step * 5];
		}
		if (entity.type === "scout") {
			return [step * 6, step * 7];
		}
		if (entity.type === "marker") {
			return [step * 7, step * 8];
		}
		return [0, 0];
	}

}