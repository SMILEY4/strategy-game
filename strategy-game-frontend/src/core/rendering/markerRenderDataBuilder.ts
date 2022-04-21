import {GlobalState} from "../../state/globalState";
import {GameState} from "../gameState";
import {HexLayout, TilemapRenderDataBuilder} from "./tilemapRenderDataBuilder";
import GLBuffer, {GLBufferType, GLBufferUsage} from "./utils/glBuffer";
import PlaceMarkerCommand = GlobalState.PlaceMarkerCommand;
import MarkerRenderData = GameState.MarkerRenderData;
import PlayerMarker = GlobalState.PlayerMarker;


export class MarkerRenderDataBuilder {


	public static build(markers: PlayerMarker[], markerCommands: PlaceMarkerCommand[], gl: WebGL2RenderingContext): MarkerRenderData | null {
		if (markers.length === 0 && markerCommands.length === 0) {
			return null;
		} else {
			const data = MarkerRenderDataBuilder.buildDataArrays(markers, markerCommands, TilemapRenderDataBuilder.DEFAULT_HEX_LAYOUT);
			return MarkerRenderDataBuilder.arrayDataToRenderData(data, gl);
		}
	}


	public static buildDataArrays(markers: PlayerMarker[], markerCommands: PlaceMarkerCommand[], layout: HexLayout): { indices: number[], positions: number[], markerData: number[] } {

		const indices: number[] = [];
		const positions: number[] = [];
		const markerData: number[] = [];

		markers.forEach((marker, index) => {
			const pixelPos = TilemapRenderDataBuilder.hexToPixel(layout, marker.q, marker.r, 0);
			indices.push(...MarkerRenderDataBuilder.buildIndices(index));
			positions.push(...MarkerRenderDataBuilder.buildPositions(layout.size, pixelPos[0], pixelPos[1]));
			markerData.push(...MarkerRenderDataBuilder.buildMarkerData(marker.playerId));
		});

		markerCommands.forEach((marker, index) => {
			const pixelPos = TilemapRenderDataBuilder.hexToPixel(layout, marker.q, marker.r, 0);
			indices.push(...MarkerRenderDataBuilder.buildIndices(index+markers.length));
			positions.push(...MarkerRenderDataBuilder.buildPositions(layout.size, pixelPos[0], pixelPos[1]));
			markerData.push(...MarkerRenderDataBuilder.buildMarkerData(-1));
		});

		return {
			indices: indices,
			positions: positions,
			markerData: markerData
		};

	}


	private static arrayDataToRenderData(arrayData: ({ indices: number[], positions: number[], markerData: number[] }), gl: WebGL2RenderingContext): MarkerRenderData {
			return {
				bufferIndices: new GLBuffer({
					debugName: "indices",
					type: GLBufferType.ELEMENT_ARRAY_BUFFER,
					usage: GLBufferUsage.STATIC_DRAW,
					data: arrayData.indices
				}).create(gl),
				bufferPositions: new GLBuffer({
					debugName: "positions",
					type: GLBufferType.ARRAY_BUFFER,
					usage: GLBufferUsage.STATIC_DRAW,
					data: arrayData.positions
				}).create(gl),
				bufferMarkerData: new GLBuffer({
					debugName: "markerData",
					type: GLBufferType.ARRAY_BUFFER,
					usage: GLBufferUsage.STATIC_DRAW,
					data: arrayData.markerData
				}).create(gl)
			};
	}


	private static buildIndices(elementOffset: number): number[] {
		const offset = elementOffset * 3;
		return [
			0, 1, 2
		].map(i => i + offset);
	}

	private static buildPositions(size: [number, number], offX: number, offY: number): number[] {
		return [
			offX, offY,
			offX - (size[0] / 3), offY + size[1],
			offX + (size[0] / 3), offY + size[1]
		];
	}

	private static buildMarkerData(id: number): number[] {
		return [
			id, id, id
		];
	}

}