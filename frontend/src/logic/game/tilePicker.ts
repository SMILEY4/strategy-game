import {Camera} from "../../common/webgl/camera";
import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {Projections} from "../../common/webgl/projections";
import {LocalTileDataAccess} from "../../state/access/localTileDataAccess";
import {LocalGameDataAccess} from "../../state/access/localGameDataAccess";
import {Tile} from "../../models/tile/tile";

export interface TilePicker {
	tileAt(screenX: number, screenY: number, canvasHandle: CanvasHandle): Tile | null;
}

export class TilePickerImpl implements TilePicker {

	private readonly localTileDataAccess: LocalTileDataAccess;
	private readonly localGameDataAccess: LocalGameDataAccess;

	constructor(localTileDataAccess: LocalTileDataAccess, localGameDataAccess: LocalGameDataAccess) {
		this.localTileDataAccess = localTileDataAccess;
		this.localGameDataAccess = localGameDataAccess;
	}


	tileAt(screenX: number, screenY: number, canvasHandle: CanvasHandle): Tile | null {
		const hexPos = Projections.screenToHex(this.camera(canvasHandle), screenX, screenY);
		return this.localTileDataAccess.getAt(hexPos.x, hexPos.y);
	}

	private camera(canvasHandle: CanvasHandle): Camera {
		const cameraData = this.localGameDataAccess.getCamera();
		return Camera.create(
			cameraData,
			canvasHandle.getCanvasWidth(), canvasHandle.getCanvasHeight(),
			canvasHandle.getClientWidth(), canvasHandle.getClientHeight(),
		);
	}
}