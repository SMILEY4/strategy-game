import {VertexBufferResource, VertexDataResource, VertexRenderNode} from "../../common/graph/vertexRenderNode";
import {GLAttributeType} from "../../../common/webgl/glTypes";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../common/webgl/mixedArrayBuffer";
import {TilemapUtils} from "../../../common/tilemapUtils";
import {Tile} from "../../../models/base/tile";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {buildMap, shuffleArray} from "../../../common/utils";
import {TerrainType} from "../../../models/base/TerrainType";
import {BorderBuilder} from "./utils/borderBuilder";
import {packBorder} from "./utils/packBorder";
import {Visibility} from "../../../models/base/visibility";
import {mapHiddenOrNull} from "../../../common/hiddenType";
import {NodeInput} from "../../common/graph/nodeInput";
import {TilesBaseVertexNode} from "./tilesBaseVertexNode";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;
import {GameWebGLRenderContext} from "../gameRenderContext";
import {Random} from "../../../common/random";

export class TilesVertexNode extends VertexRenderNode<GameWebGLRenderContext> {

	public static readonly ID = "vertexnode.tiles";

	private static readonly WATER_PATTERN = [
		// world position (x,y)
		...MixedArrayBufferType.VEC2,
		// depth
		MixedArrayBufferType.FLOAT,
		// packed water border mask
		MixedArrayBufferType.INT,
	];

	private static readonly LAND_PATTERN = [
		// world position (x,y)
		...MixedArrayBufferType.VEC2,
		// color (r,g,b,a)
		...MixedArrayBufferType.VEC4,
	];

	private static readonly FOG_PATTERN = [
		// world position (x,y)
		...MixedArrayBufferType.VEC2,
		// visibility
		MixedArrayBufferType.INT,
	];

	private tileIndices: number[] = [];

	constructor() {
		super({
			id: TilesVertexNode.ID,
			changeKey: TilesVertexNode.ID,
			input: [
				new NodeInput.VertexBuffer({
					name: "vertexbuffer.mesh.tile",
				}),
			],
			output: [
				new VertexBuffer({
					name: "vertexbuffer.instance.tilewater",
					attributes: [
						{
							name: "in_worldPosition",
							type: GLAttributeType.FLOAT,
							amountComponents: 2,
							divisor: 1,
						},
						{
							name: "in_depth",
							type: GLAttributeType.FLOAT,
							amountComponents: 1,
							divisor: 1,
						},
						{
							name: "in_borderMask",
							type: GLAttributeType.INT,
							amountComponents: 1,
							divisor: 1,
						},
					],
				}),
				new VertexBuffer({
					name: "vertexbuffer.instance.tileland",
					attributes: [
						{
							name: "in_worldPosition",
							type: GLAttributeType.FLOAT,
							amountComponents: 2,
							divisor: 1,
						},
						{
							name: "in_color",
							type: GLAttributeType.FLOAT,
							amountComponents: 3,
							divisor: 1,
						},
					],
				}),
				new VertexBuffer({
					name: "vertexbuffer.instance.tilefog",
					attributes: [
						{
							name: "in_worldPosition",
							type: GLAttributeType.FLOAT,
							amountComponents: 2,
							divisor: 1,
						},
						{
							name: "in_visibility",
							type: GLAttributeType.INT,
							amountComponents: 1,
							divisor: 1,
						},
					],
				}),
				new VertexDescriptor({
					name: "vertexdata.water",
					type: "instanced",
					buffers: [
						"vertexbuffer.mesh.tile",
						"vertexbuffer.instance.tilewater",
					],
				}),
				new VertexDescriptor({
					name: "vertexdata.land",
					type: "instanced",
					buffers: [
						"vertexbuffer.mesh.tile",
						"vertexbuffer.instance.tileland",
					],
				}),
				new VertexDescriptor({
					name: "vertexdata.fog",
					type: "instanced",
					buffers: [
						"vertexbuffer.mesh.tile",
						"vertexbuffer.instance.tilefog",
					],
				}),
			],
		});
	}


	public execute(context: GameWebGLRenderContext): VertexDataResource {

		const tiles = context.tiles;
		const tileCounts = this.countTileTypes(tiles);

		if (this.tileIndices.length !== tiles.length) {
			this.tileIndices = this.buildTileIndices(tiles.length);
		}

		const [arrayBufferWater, cursorWater] = MixedArrayBuffer.createWithCursor(tileCounts.water, TilesVertexNode.WATER_PATTERN);
		const [arrayBufferLand, cursorLand] = MixedArrayBuffer.createWithCursor(tileCounts.land, TilesVertexNode.LAND_PATTERN);
		const [arrayBufferFog, cursorFog] = MixedArrayBuffer.createWithCursor(tileCounts.fog, TilesVertexNode.FOG_PATTERN);

		for (let i = 0, n = this.tileIndices.length; i < n; i++) {
			const index = this.tileIndices[i];
			const tile = tiles[index];
			if (this.isFog(tile)) {
				this.appendFogInstance(tile, cursorFog);
			}
			if (this.isLand(tile)) {
				this.appendLandInstance(tile, cursorLand, context);
			}
			if (this.isWater(tile)) {
				this.appendWaterInstance(tile, cursorWater, context);
			}
		}

		return new VertexDataResource({
			buffers: buildMap({
				"vertexbuffer.instance.tilewater": new VertexBufferResource(arrayBufferWater.getRawBuffer()),
				"vertexbuffer.instance.tileland": new VertexBufferResource(arrayBufferLand.getRawBuffer()),
				"vertexbuffer.instance.tilefog": new VertexBufferResource(arrayBufferFog.getRawBuffer()),
			}),
			outputs: buildMap({
				"vertexdata.water": {
					vertexCount: TilesBaseVertexNode.MESH_VERTEX_COUNT,
					instanceCount: tileCounts.water,
				},
				"vertexdata.land": {
					vertexCount: TilesBaseVertexNode.MESH_VERTEX_COUNT,
					instanceCount: tileCounts.land,
				},
				"vertexdata.fog": {
					vertexCount: TilesBaseVertexNode.MESH_VERTEX_COUNT,
					instanceCount: tileCounts.fog,
				},
			}),
		});
	}

	private buildTileIndices(tileCount: number): number[] {
		const indices = [...Array(tileCount).keys()];
		shuffleArray(indices);
		return indices;
	}

	//===== INSTANCES ===============================================

	private countTileTypes(tiles: Tile[]): { land: number, water: number, fog: number } {
		let countLand = 0;
		let countWater = 0;
		let countFog = 0;
		for (let i = 0, n = tiles.length; i < n; i++) {
			const tile = tiles[i];
			if (this.isFog(tile)) {
				countFog++;
			}
			if (this.isLand(tile)) {
				countLand++;
			}
			if (this.isWater(tile)) {
				countWater++;
			}
		}
		return {
			land: countLand,
			water: countWater,
			fog: countFog,
		};
	}


	//===== FOG INSTANCES ===========================================

	private isFog(tile: Tile): boolean {
		return tile.visibility !== Visibility.UNKNOWN;
	}

	private appendFogInstance(tile: Tile, cursor: MixedArrayBufferCursor) {
		const q = tile.identifier.q;
		const r = tile.identifier.r;

		// world position
		const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
		cursor.append(center[0]);
		cursor.append(center[1]);

		// visibility
		cursor.append(tile.visibility.renderId);

	}

	//===== WATER INSTANCES =========================================

	private isWater(tile: Tile): boolean {
		return tile.base.visible && tile.base.value.terrainType == TerrainType.WATER;
	}

	private appendWaterInstance(tile: Tile, cursor: MixedArrayBufferCursor, context: GameWebGLRenderContext) {
		const q = tile.identifier.q;
		const r = tile.identifier.r;

		// world position
		const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
		cursor.append(center[0]);
		cursor.append(center[1]);

		// color
		const heightJitter = Random.normalized(tile.identifier.id) * 0.1 - 0.5;
		cursor.append(1 - this.clamp(0, (tile.base.value.height + 1) * 2 + heightJitter, 1));

		// water border mask
		const border = BorderBuilder.build(tile, context.tileByPosProvider, false, (ta, tb) => {
			const a = mapHiddenOrNull(ta.base, it => it.terrainType);
			const b = mapHiddenOrNull(tb.base, it => it.terrainType);
			return (!a && !b) ? false : a === TerrainType.WATER && b !== null && a !== b;
		});
		const borderPacked = packBorder(border);
		cursor.append(borderPacked);
	}

	//===== LAND INSTANCES ==========================================

	private isLand(tile: Tile): boolean {
		return tile.base.visible && tile.base.value.terrainType == TerrainType.LAND;
	}

	private appendLandInstance(tile: Tile, cursor: MixedArrayBufferCursor, context: GameWebGLRenderContext) {
		const q = tile.identifier.q;
		const r = tile.identifier.r;

		// world position
		const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
		cursor.append(center[0]);
		cursor.append(center[1]);

		// color
		const heightJitter = Random.normalized(tile.identifier.id) * 0.1 - 0.5;
		const color = this.mix(context.renderConfig.land.colorLight, context.renderConfig.land.colorDark, tile.base.value.height * 2 + heightJitter);
		cursor.append(color);
	}


	//===== UTILITIES ===============================================

	private mix(x: [number, number, number], y: [number, number, number], a: number): [number, number, number] {
		const clampedA = this.clamp(0, a, 1);
		return [
			x[0] * (1 - clampedA) + y[0] * clampedA,
			x[1] * (1 - clampedA) + y[1] * clampedA,
			x[2] * (1 - clampedA) + y[2] * clampedA,
		];
	}

	private clamp(min: number, value: number, max: number): number {
		return Math.max(min, Math.min(value, max));
	}

}