import {VertexBufferResource, VertexDataResource, VertexRenderNode} from "../../common/graph/vertexRenderNode";
import {GLAttributeType} from "../../../common/webgl/glTypes";
import {buildMap} from "../../../common/utils";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {GameWebGLRenderContext} from "../gameRenderContext";
import {NodeInput} from "../../common/graph/nodeInput";
import {ProvidedNodeInputs} from "../../common/graph/providedNodeInputs";
import {TilemapUtils} from "../../../common/tilemapUtils";
import {WorldObjectType} from "../../../models/base/worldObjectType";
import {SpriteBuffer} from "../../../common/webgl/spriteBuffer";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;
import TextureAtlasData = NodeInput.TextureAtlasData;
import {Settlement} from "../../../models/base/Settlement";
import {TextureAtlasEntry} from "../../../common/webgl/textureAtlas";
import {WorldObject} from "../../../models/base/worldObject";

export class MapDetailsVertexNode extends VertexRenderNode<GameWebGLRenderContext> {

	public static readonly ID = "vertexnode.mapdetails";

	private readonly spriteBuffer = new SpriteBuffer();

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

		this.spriteBuffer.clear();

		// settlements
		const settlementAtlasEntry = inputs.getTextureAtlasEntry("/icons/tileset.png", "settlement1");
		const settlements = context.settlements;
		for (let i = 0, n = settlements.length; i < n; i++) {
			const settlement = settlements[i];
			this.addSettlement(this.spriteBuffer, settlement, settlementAtlasEntry);
		}

		// world objects
		const scoutAtlasEntry = inputs.getTextureAtlasEntry("/icons/tileset.png", "eye");
		const settlerAtlasEntry = inputs.getTextureAtlasEntry("/icons/tileset.png", "marker");
		const worldObjects = context.worldObjects;
		for (let i = 0, n = worldObjects.length; i < n; i++) {
			const worldObject = worldObjects[i];
			if (worldObject.type === WorldObjectType.SCOUT) {
				this.addScout(this.spriteBuffer, worldObject, scoutAtlasEntry);
			}
			if (worldObject.type === WorldObjectType.SETTLER) {
				this.addSettler(this.spriteBuffer, worldObject, settlerAtlasEntry);
			}
		}

		return new VertexDataResource({
			buffers: buildMap({
				"vertexbuffer.mapdetails": new VertexBufferResource(this.spriteBuffer.buildRawBuffer()),
			}),
			outputs: buildMap({
				"vertexdata.mapdetails": {
					vertexCount: this.spriteBuffer.getVertexCount(),
					instanceCount: 0,
				},
			}),
		});
	}

	private addSettlement(spriteBuffer: SpriteBuffer, settlement: Settlement, atlasEntry: TextureAtlasEntry) {
		const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, settlement.tile.q, settlement.tile.r);
		for(let i=0; i<10; i++) {
			spriteBuffer.add({
				atlasEntry: atlasEntry,
				x: tileCenter[0] + (Math.random() * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] / 2),
				y: tileCenter[1] + (Math.random() * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] / 2),
				scaleX: 20,
				scaleY: 20,
			});
		}
	}

	private addSettler(spriteBuffer: SpriteBuffer, settler: WorldObject, atlasEntry: TextureAtlasEntry) {
		const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, settler.tile.q, settler.tile.r);
		spriteBuffer.add({
			atlasEntry: atlasEntry,
			x: tileCenter[0],
			y: tileCenter[1],
			scaleX: 20,
			scaleY: 20,
		});
	}

	private addScout(spriteBuffer: SpriteBuffer, scout: WorldObject, atlasEntry: TextureAtlasEntry) {
		const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, scout.tile.q, scout.tile.r);
		spriteBuffer.add({
			atlasEntry: atlasEntry,
			x: tileCenter[0],
			y: tileCenter[1],
			scaleX: 20,
			scaleY: 20,
		});
	}

}