import {
	VertexGeneratorResult,
} from "../../common/rendergraph/nodes/vertexGeneratorRenderGraphNode";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../common/webgl/mixedArrayBuffer";
import {Tile} from "../../models/tile/tile";
import {MapMode} from "../../models/misc/mapMode";
import {TilemapUtils} from "../../common/tilemapUtils";
import {TileSummary} from "../../models/tile/tileSummary";
import {buildMap, isPointInRectangle, Rectangle} from "../../common/utils";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {BorderBuilder} from "../utils/borderBuilder";
import {packBorder} from "../utils/packBorder";
import {Projections} from "../../common/webgl/projections";

export namespace OverlayInstancesVertexGenerator {

	export const OUTPUT_ID = "overlay.instances";

	const INSTANCE_PATTERN = [
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

	export function func(context: RenderGraphNodeContext): Map<string, VertexGeneratorResult> {

		const relevantTiles = context.get<Tile[]>("relevantTiles");
		const tileByPosProvider = context.get<(q: number, r: number) => Tile | null>("tileByPosProvider");
		const mapMode = context.get<MapMode>("mapMode");
		const moveTargets = context.get<TileSummary[]>("moveTargets");

		const [arrayBufferOverlay, cursorOverlay] = MixedArrayBuffer.createWithCursor(relevantTiles.length, INSTANCE_PATTERN);


		const mapModeContext = mapMode.renderData.context(relevantTiles);
		const highlightMovementTiles = new Set<string>(moveTargets.map(it => it.position.q + "/" + it.position.r));

		for (let i = 0, n = relevantTiles.length; i < n; i++) {
			// todo: optimization: only create instances for tiles that require overlay ?
			const tile = relevantTiles[i];
			appendOverlayInstance(tile, mapMode, mapModeContext, highlightMovementTiles, tileByPosProvider, cursorOverlay);
		}

		return buildMap([
			[
				OUTPUT_ID,
				{
					data: arrayBufferOverlay.getRawBuffer(),
					entryCount: relevantTiles.length
				}
			]
		])
	}

	function appendOverlayInstance(
		tile: Tile,
		mapMode: MapMode,
		mapModeContext: any,
		highlightMovementTiles: Set<string>,
		tileByPosProvider: (q: number, r: number) => Tile | null,
		cursor: MixedArrayBufferCursor,
	) {
		const q = tile.position.q;
		const r = tile.position.r;

		// world position
		const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
		cursor.append(center[0]);
		cursor.append(center[1]);

		// tile position
		cursor.append(q);
		cursor.append(r);

		// primary border mask
		const borderData = BorderBuilder.build(tile, tileByPosProvider, mapMode.renderData.borderDefault, mapMode.renderData.borderCheck);
		const borderPacked = packBorder(borderData);
		cursor.append(borderPacked);

		// primary border & fill color
		cursor.append(mapMode.renderData.borderColor(tile, mapModeContext));
		cursor.append(mapMode.renderData.fillColor(tile, mapModeContext));


		// highlight border mask & border color & fill color
		if (highlightMovementTiles.has(tile.position.q + "/" + tile.position.r)) {
			cursor.append(0);
			cursor.append([0, 0, 0, 0]);
			cursor.append([0.941, 0.921, 0.686, 0.5]);
		} else {
			cursor.append(0);
			cursor.append([0, 0, 0, 0]);
			cursor.append([0, 0, 0, 0]);
		}
	}


}