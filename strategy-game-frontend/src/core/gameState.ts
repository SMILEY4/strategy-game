import {Camera} from "./rendering/utils/camera";
import TilemapChunkRenderData = GameState.TilemapChunkRenderData;
import GLBuffer from "./rendering/utils/glBuffer";

export interface GameState {
	camera: Camera;
	tilemapDirty: boolean;
	tilemap: TilemapChunkRenderData[];
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
			tilemap: []
		};
	}

}