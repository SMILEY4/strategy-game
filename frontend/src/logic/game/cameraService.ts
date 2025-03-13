import {TileIdentifier} from "../../models/base/tile";
import {LocalGameDataAccess} from "../../state/local/access/localGameDataAccess";
import {GameStateWriter} from "../../state/gameStateWriter";
import {Projections} from "../../common/webgl/projections";

export interface CameraService {
	center(tile: TileIdentifier): void;
	move(dx: number, dy: number): void;
	zoom(d: number): void;
}

export class CameraServiceImpl implements CameraService {

	private readonly localGameDataAccess: LocalGameDataAccess;
	private readonly gameStateWriter: GameStateWriter;

	constructor(localGameDataAccess: LocalGameDataAccess, gameStateWriter: GameStateWriter) {
		this.localGameDataAccess = localGameDataAccess;
		this.gameStateWriter = gameStateWriter;
	}

	center(tile: TileIdentifier): void {
		const pos = Projections.hexToWorld(tile.q, tile.r);
		const camera = this.localGameDataAccess.getCamera();
		this.gameStateWriter.setCameraData({
			x: -pos.x,
			y: -pos.y,
			zoom: camera.zoom,
		});
	}

	move(dx: number, dy: number): void {
		const camera = this.localGameDataAccess.getCamera();
		this.gameStateWriter.setCameraData({
			x: camera.x + (dx / camera.zoom),
			y: camera.y - (dy / camera.zoom),
			zoom: camera.zoom,
		});
	}

	zoom(d: number): void {
		const camera = this.localGameDataAccess.getCamera();
		const zoom = Math.max(0.01, camera.zoom - d);
		this.gameStateWriter.setCameraData({
			x: camera.x,
			y: camera.y,
			zoom: zoom,
		});
	}
}