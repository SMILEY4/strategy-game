import {Camera} from "../../common/webgl/camera";
import {Tile} from "../../models/base/tile";
import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {Projections} from "../../common/webgl/projections";
import {LocalTileDataAccess} from "../../state/local/access/localTileDataAccess";
import {LocalGameDataAccess} from "../../state/local/access/localGameDataAccess";
import {LocalTileIdentifier} from "../../state/local/localTile";

export interface TilePicker {
	tileAt(screenX: number, screenY: number, canvasHandle: CanvasHandle): Tile | null;
	tileIdAt(screenX: number, screenY: number, canvasHandle: CanvasHandle): LocalTileIdentifier | null;
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


	tileIdAt(screenX: number, screenY: number, canvasHandle: CanvasHandle): LocalTileIdentifier | null {
		const tile = this.tileAt(screenX, screenY, canvasHandle);
		return tile ? tile.identifier : null;
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