import {Camera} from "../../shared/webgl/camera";
import {Tile} from "../../models/tile";
import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {Projections} from "../../shared/webgl/projections";
import {GameRepository} from "../../state/gameRepository";

export class TilePicker {

	private readonly canvasHandle: CanvasHandle;
	private readonly gameRepository: GameRepository;

	constructor(canvasHandle: CanvasHandle, gameRepository: GameRepository) {
		this.canvasHandle = canvasHandle;
		this.gameRepository = gameRepository;
	}

	public tileAt(x: number, y: number): Tile | null {
		const hexPos = Projections.screenToHex(this.camera(), x, y);
		return this.gameRepository.getTileAt(hexPos.x, hexPos.y);
	}

	private camera(): Camera {
		const cameraData = this.gameRepository.getCamera();
		return Camera.create(
			cameraData,
			this.canvasHandle.getCanvasWidth(), this.canvasHandle.getCanvasHeight(),
			this.canvasHandle.getClientWidth(), this.canvasHandle.getClientHeight(),
		);
	}
}