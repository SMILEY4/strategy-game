import {VertexBufferResource, VertexDataResource, VertexRenderNode} from "../../common/graph/vertexRenderNode";
import {GLAttributeType} from "../../../common/webgl/glTypes";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../common/webgl/mixedArrayBuffer";
import {TilemapUtils} from "../../../common/tilemapUtils";
import {Tile} from "../../../models/base/tile";
import {BorderBuilder} from "./borderBuilder";
import {packBorder} from "./packBorder";
import {MapMode} from "../../../models/base/mapMode";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {TileRepository} from "../../../state/repository/tileRepository";
import {SessionRepository} from "../../../state/repository/sessionRepository";
import {WorldObjectRepository} from "../../../state/repository/worldObjectRepository";
import {NodeInput} from "../../common/graph/nodeInput";
import {buildMap} from "../../../common/utils";
import {OverlayBaseVertexNode} from "./overlayBaseVertexNode";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;

export class OverlayVertexNode extends VertexRenderNode {

	public static readonly ID = "vertexnode.overlay";

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

	private readonly tileRepository: TileRepository;
	private readonly sessionRepository: SessionRepository;
	private readonly worldObjectRepository: WorldObjectRepository;

	constructor(
		tileRepository: TileRepository,
		sessionRepository: SessionRepository,
		worldObjectRepository: WorldObjectRepository,
	) {
		super({
			id: OverlayVertexNode.ID,
			changeKey: OverlayVertexNode.ID,
			input: [
				new NodeInput.VertexBuffer({
					name: "vertexbuffer.mesh.overlay",
				}),
			],
			output: [
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
		this.tileRepository = tileRepository;
		this.sessionRepository = sessionRepository;
		this.worldObjectRepository = worldObjectRepository;
	}

	public execute(): VertexDataResource {

		const tiles = this.tileRepository.getAll();
		const tileCounts = this.countTiles(tiles);

		const [arrayBufferOverlay, cursorOverlay] = MixedArrayBuffer.createWithCursor(tileCounts, OverlayVertexNode.INSTANCE_PATTERN);

		const mapMode = this.sessionRepository.getMapMode();
		const mapModeContext = mapMode.renderData.context(tiles);
		const highlightMovementTiles = new Set<string>(this.worldObjectRepository.getMovementTargets().map(it => it.tile.q + "/" + it.tile.r));

		for (let i = 0, n = tiles.length; i < n; i++) {
			const tile = tiles[i];
			this.appendOverlayInstance(tile, mapMode, mapModeContext, highlightMovementTiles, cursorOverlay);
		}

		return new VertexDataResource({
			buffers: buildMap({
				"vertexbuffer.instance.overlay": new VertexBufferResource(arrayBufferOverlay.getRawBuffer()),
			}),
			outputs: buildMap({
				"vertexdata.overlay": {
					vertexCount: OverlayBaseVertexNode.MESH_VERTEX_COUNT,
					instanceCount: tileCounts,
				},
			}),
		});
	}

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
		const borderData = BorderBuilder.build(tile, this.tileRepository, mapMode.renderData.borderDefault, mapMode.renderData.borderCheck);
		const borderPacked = packBorder(borderData);
		cursor.append(borderPacked);

		// primary border & fill color
		cursor.append(mapMode.renderData.borderColor(tile, mapModeContext));
		cursor.append(mapMode.renderData.fillColor(tile, mapModeContext));


		// highlight border mask & border color & fill color
		if (highlightMovementTiles.has(tile.identifier.q + "/" + tile.identifier.r)) {
			cursor.append(0);
			cursor.append([0, 0, 0, 0]);
			cursor.append([0.941, 0.921, 0.686, 0.8]);
		} else {
			cursor.append(0);
			cursor.append([0, 0, 0, 0]);
			cursor.append([0, 0, 0, 0]);
		}
	}

}