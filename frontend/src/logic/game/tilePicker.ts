import {Camera} from "../../common/webgl/camera";
import {Tile} from "../../models/base/tile";
import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {Projections} from "../../common/webgl/projections";
import {TileRepository} from "../../state/repository/tileRepository";
import {CameraRepository} from "../../state/repository/cameraRepository";

export class TilePicker {

	private readonly tileRepository: TileRepository;
	private readonly cameraRepository: CameraRepository;

	constructor(tileRepository: TileRepository, cameraRepository: CameraRepository) {
		this.tileRepository = tileRepository;
		this.cameraRepository = cameraRepository;
	}

	/**
	 * Get the tile at the given screen coordinates
	 */
	public tileAt(screenX: number, screenY: number, canvasHandle: CanvasHandle): Tile | null {
		const hexPos = Projections.screenToHex(this.camera(canvasHandle), screenX, screenY);
		return this.tileRepository.getAt(hexPos.x, hexPos.y);
	}

	private camera(canvasHandle: CanvasHandle): Camera {
		const cameraData = this.cameraRepository.get();
		return Camera.create(
			cameraData,
			canvasHandle.getCanvasWidth(), canvasHandle.getCanvasHeight(),
			canvasHandle.getClientWidth(), canvasHandle.getClientHeight(),
		);
	}
}