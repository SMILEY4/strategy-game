import {VertexBufferResource, VertexDataResource, VertexRenderNode} from "../../core/graph/vertexRenderNode";
import {GLAttributeType} from "../../../shared/webgl/glTypes";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../shared/webgl/mixedArrayBuffer";
import {TilemapUtils} from "../../../shared/tilemapUtils";
import {Tile} from "../../../models/primitives/tile";
import {BorderBuilder} from "./borderBuilder";
import {packBorder} from "./packBorder";
import {MapMode} from "../../../models/primitives/mapMode";
import {NodeOutput} from "../../core/graph/nodeOutput";
import {ChangeProvider} from "../changeProvider";
import {RenderRepository} from "../renderRepository";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;

export class OverlayVertexNode extends VertexRenderNode {

	public static readonly ID = "vertexnode.overlay";

	private static readonly MESH_VERTEX_COUNT = 6 * 3;

	private static readonly MESH_PATTERN = [
		// vertex position
		...MixedArrayBufferType.VEC2,
		// texture coords
		...MixedArrayBufferType.VEC2,
		// corner data
		...MixedArrayBufferType.VEC3,
		// direction data
		MixedArrayBufferType.INT,
	];

	private static readonly INSTANCE_PATTERN = [
		// world position (x,y)
		...MixedArrayBufferType.VEC2,
		// tile position (q,r)
		...MixedArrayBufferType.INT_VEC2,

		// primary border mask
		MixedArrayBufferType.INT,
		// primary border color
		...MixedArrayBufferType.VEC4,
		// primary fill color
		...MixedArrayBufferType.VEC4,

		// highlight border mask
		MixedArrayBufferType.INT,
		// highlight border color
		...MixedArrayBufferType.VEC4,
		// highlight fill color
		...MixedArrayBufferType.VEC4,
	];

	private readonly changeProvider: ChangeProvider;
	private readonly repository: RenderRepository;

	constructor(changeProvider: ChangeProvider, renderRepository: RenderRepository) {
		super({
			id: OverlayVertexNode.ID,
			input: [],
			output: [
				new VertexBuffer({
					name: "vertexbuffer.mesh.overlay",
					attributes: [
						{
							name: "in_vertexPosition",
							type: GLAttributeType.FLOAT,
							amountComponents: 2,
						},
						{
							name: "in_textureCoordinates",
							type: GLAttributeType.FLOAT,
							amountComponents: 2,
						},
						{
							name: "in_cornerData",
							type: GLAttributeType.FLOAT,
							amountComponents: 3,
						},
						{
							name: "in_directionData",
							type: GLAttributeType.INT,
							amountComponents: 1,
						},
					],
				}),
				new VertexBuffer({
					name: "vertexbuffer.instance.overlay",
					attributes: [
						{
							name: "in_worldPosition",
							type: GLAttributeType.FLOAT,
							amountComponents: 2,
							divisor: 1,
						},
						{
							name: "in_tilePosition",
							type: GLAttributeType.INT,
							amountComponents: 2,
							divisor: 1,
						},
						{
							name: "in_borderMask",
							type: GLAttributeType.INT,
							amountComponents: 1,
							divisor: 1,
						},
						{
							name: "in_borderColor",
							type: GLAttributeType.FLOAT,
							amountComponents: 4,
							divisor: 1,
						},
						{
							name: "in_fillColor",
							type: GLAttributeType.FLOAT,
							amountComponents: 4,
							divisor: 1,
						},
						{
							name: "in_highlightBorderMask",
							type: GLAttributeType.INT,
							amountComponents: 1,
							divisor: 1,
						},
						{
							name: "in_highlightBorderColor",
							type: GLAttributeType.FLOAT,
							amountComponents: 4,
							divisor: 1,
						},
						{
							name: "in_highlightFillColor",
							type: GLAttributeType.FLOAT,
							amountComponents: 4,
							divisor: 1,
						},
					],
				}),
				new VertexDescriptor({
					name: "vertexdata.overlay",
					type: "instanced",
					buffers: [
						"vertexbuffer.mesh.overlay",
						"vertexbuffer.instance.overlay",
					],
				}),
			],
		});
		this.changeProvider = changeProvider;
		this.repository = renderRepository;
	}

	public execute(): VertexDataResource {

		const buffers = new Map<string, VertexBufferResource>();
		const outputs = new Map<string, { vertexCount: number; instanceCount: number }>();

		// base mesh
		if (this.changeProvider.hasChange("basemesh")) {
			const [_, baseMeshData] = this.buildBaseMesh();
			buffers.set("vertexbuffer.mesh.overlay", new VertexBufferResource(baseMeshData));
		}

		if (this.changeProvider.hasChange(this.id)) {

			// tile instances
			const tiles = this.repository.getTilesAll();
			const tileCounts = this.countTiles(tiles);

			const [arrayBufferOverlay, cursorOverlay] = MixedArrayBuffer.createWithCursor(tileCounts, OverlayVertexNode.INSTANCE_PATTERN);

			const mapMode = this.repository.getMapMode();
			const mapModeContext = mapMode.renderData.context(tiles);
			const highlightMovementTiles = this.repository.getHighlightMovementTileIds();

			for (let i = 0, n = tiles.length; i < n; i++) {
				const tile = tiles[i];
				this.appendOverlayInstance(tile, mapMode, mapModeContext, highlightMovementTiles, cursorOverlay);
			}

			buffers.set("vertexbuffer.instance.overlay", new VertexBufferResource(arrayBufferOverlay.getRawBuffer()));
			outputs.set("vertexdata.overlay", {
				vertexCount: OverlayVertexNode.MESH_VERTEX_COUNT,
				instanceCount: tileCounts,
			});

		}

		return new VertexDataResource({
			buffers: buffers,
			outputs: outputs,
		});
	}

	//===== BASE MESH ===============================================

	private buildBaseMesh(): [number, ArrayBuffer] {
		const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(OverlayVertexNode.MESH_VERTEX_COUNT, OverlayVertexNode.MESH_PATTERN);
		this.appendBaseMeshTriangle(cursor, 0, 1);
		this.appendBaseMeshTriangle(cursor, 1, 2);
		this.appendBaseMeshTriangle(cursor, 2, 3);
		this.appendBaseMeshTriangle(cursor, 3, 4);
		this.appendBaseMeshTriangle(cursor, 4, 5);
		this.appendBaseMeshTriangle(cursor, 5, 0);
		return [OverlayVertexNode.MESH_VERTEX_COUNT, arrayBuffer.getRawBuffer()];
	}

	private appendBaseMeshTriangle(cursor: MixedArrayBufferCursor, cornerIndexA: number, cornerIndexB: number) {
		// center
		cursor.append(0);
		cursor.append(0);
		cursor.append(this.hexTextureCoordinates(-1));
		cursor.append([1, 0, 0]);
		cursor.append(cornerIndexA);
		// corner a
		cursor.append(this.hexCornerPointX(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size, 1));
		cursor.append(this.hexCornerPointY(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size, 1));
		cursor.append(this.hexTextureCoordinates(cornerIndexA));
		cursor.append([0, 1, 0]);
		cursor.append(cornerIndexA);
		// corner b
		cursor.append(this.hexCornerPointX(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size, 1));
		cursor.append(this.hexCornerPointY(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size, 1));
		cursor.append(this.hexTextureCoordinates(cornerIndexB));
		cursor.append([0, 0, 1]);
		cursor.append(cornerIndexA);
	}

	//===== INSTANCES ===============================================

	private countTiles(tiles: Tile[]): number {
		return tiles.length;
	}

	private appendOverlayInstance(tile: Tile, mapMode: MapMode, mapModeContext: any, highlightMovementTiles: Set<string>, cursor: MixedArrayBufferCursor) {
		const q = tile.identifier.q;
		const r = tile.identifier.r;

		// world position
		const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
		cursor.append(center[0]);
		cursor.append(center[1]);

		// tile position
		cursor.append(q);
		cursor.append(r);

		// primary border mask
		const borderData = BorderBuilder.build(tile, this.repository, mapMode.renderData.borderDefault, mapMode.renderData.borderCheck);
		const borderPacked = packBorder(borderData);
		cursor.append(borderPacked);

		// primary border & fill color
		cursor.append(mapMode.renderData.borderColor(tile, mapModeContext));
		cursor.append(mapMode.renderData.fillColor(tile, mapModeContext));


		// highlight border mask & border color & fill color
		if(highlightMovementTiles.has(tile.identifier.q + "/" + tile.identifier.r)) {
			cursor.append(0);
			cursor.append([0, 0, 0, 0]);
			cursor.append([0.941, 0.921, 0.686, 0.9]); // todo: find color
		} else {
			cursor.append(0);
			cursor.append([0, 0, 0, 0]);
			cursor.append([0, 0, 0, 0]);
		}
	}


	//===== UTILITIES ===============================================

	private hexCornerPointX(cornerIndex: number, size: [number, number], scale: number): number {
		const angleDeg = 60 * cornerIndex - 30;
		const angleRad = Math.PI / 180 * angleDeg;
		return size[0] * Math.cos(angleRad) * scale;
	}

	private hexCornerPointY(cornerIndex: number, size: [number, number], scale: number): number {
		const angleDeg = 60 * cornerIndex - 30;
		const angleRad = Math.PI / 180 * angleDeg;
		return size[1] * Math.sin(angleRad) * scale;
	}

	private hexTextureCoordinates(cornerIndex: number): [number, number] {
		const xLeft = 0.065;
		const xCenter = 0.5;
		const xRight = 0.935;
		const yBottom = 0;
		const yCenterBottom = 0.25;
		const yCenter = 0.5;
		const yCenterTop = 0.75;
		const yTop = 1;
		switch (cornerIndex) {
			case -1:
				return [xCenter, yCenter];
			case 0:
				return [xRight, yCenterBottom];
			case 1:
				return [xRight, yCenterTop];
			case 2:
				return [xCenter, yTop];
			case 3:
				return [xLeft, yCenterTop];
			case 4:
				return [xLeft, yCenterBottom];
			case 5:
				return [xCenter, yBottom];
			default:
				return [0, 0];
		}
	}

}