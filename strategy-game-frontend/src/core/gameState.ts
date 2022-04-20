import {Camera} from "./rendering/utils/camera";
import GLBuffer from "./rendering/utils/glBuffer";
import TilemapChunkRenderData = GameState.TilemapChunkRenderData;
import MarkerRenderData = GameState.MarkerRenderData;

export interface GameState {
	camera: Camera;
	tilemapDirty: boolean;
	tilemap: TilemapChunkRenderData[];
	tileMouseOver: [number, number] | null;
	markersDirty: boolean,
	markers: MarkerRenderData | null;
}

export namespace GameState {

	export interface TilemapChunkRenderData {
		bufferIndices: GLBuffer,
		bufferPositions: GLBuffer,
		bufferTileData: GLBuffer,
	}

	export interface MarkerRenderData {
		bufferIndices: GLBuffer,
		bufferPositions: GLBuffer,
		bufferMarkerData: GLBuffer,
	}

	export function createInitial(): GameState {
		return {
			camera: new Camera(),
			tilemapDirty: true,
			tilemap: [],
			tileMouseOver: null,
			markersDirty: true,
			markers: null
		};
	}

}