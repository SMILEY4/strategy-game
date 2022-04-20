import {Camera} from "./rendering/utils/camera";
import GLBuffer from "./rendering/utils/glBuffer";
import TilemapChunkRenderData = GameState.TilemapChunkRenderData;

export interface GameState {
	camera: Camera;
	tilemapDirty: boolean;
	tilemap: TilemapChunkRenderData[];
	tileMouseOver: [number, number] | null;
}

export namespace GameState {

	export interface TilemapChunkRenderData {
		bufferIndices: GLBuffer,
		bufferPositions: GLBuffer,
		bufferTileData: GLBuffer,
	}

	export function createInitial(): GameState {
		return {
			camera: new Camera(),
			tilemapDirty: true,
			tilemap: [],
			tileMouseOver: null
		};
	}

}