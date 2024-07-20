import {Camera} from "../shared/webgl/camera";
import {Tile} from "../models/tile";
import {CanvasHandle} from "../shared/webgl/canvasHandle";
import {Projections} from "../shared/webgl/projections";
import {GameRepository} from "./gameRepository";

export class TilePicker {

	private readonly gameRepository: GameRepository;

	constructor(gameRepository: GameRepository) {
		this.gameRepository = gameRepository;
	}

	public tileAt(x: number, y: number, canvasHandle: CanvasHandle): Tile | null {
		const hexPos = Projections.screenToHex(this.camera(canvasHandle), x, y);
		return this.gameRepository.getTileAt(hexPos.x, hexPos.y);
	}

	private camera(canvasHandle: CanvasHandle): Camera {
		const cameraData = this.gameRepository.getCamera();
		return Camera.create(
			cameraData,
			canvasHandle.getCanvasWidth(), canvasHandle.getCanvasHeight(),
			canvasHandle.getClientWidth(), canvasHandle.getClientHeight(),
		);
	}
}