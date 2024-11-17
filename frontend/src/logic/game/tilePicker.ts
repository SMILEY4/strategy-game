import {Camera} from "../../common/webgl/camera";
import {Tile} from "../../models/base/tile";
import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {Projections} from "../../common/webgl/projections";
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