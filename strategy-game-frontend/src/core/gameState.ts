import {Camera} from "./rendering/utils/camera";

export interface GameState {
	camera: Camera;
	tileMouseOver: [number, number] | null;
}

export namespace GameState {

	export function createInitial(): GameState {
		return {
			camera: new Camera(),
			tileMouseOver: null
		};
	}

}