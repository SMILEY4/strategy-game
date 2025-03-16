import {GameStateWriter} from "../../../state/gameStateWriter";
import {Projections} from "../../../common/webgl/projections";
import {TilePosition} from "../../../models/tile/tilePosition";
import {GameStateAccess} from "../../../state/gameStateAccess";

export interface CameraService {
	center(tile: TilePosition): void;
	move(dx: number, dy: number): void;
	zoom(d: number): void;
}

export class CameraServiceImpl implements CameraService {

	private readonly localStateAccess: GameStateAccess;
	private readonly gameStateWriter: GameStateWriter;

	constructor(localStateAccess: GameStateAccess, gameStateWriter: GameStateWriter) {
		this.localStateAccess = localStateAccess;
		this.gameStateWriter = gameStateWriter;
	}

	center(tile: TilePosition): void {
		const pos = Projections.hexToWorld(tile.q, tile.r);
		const camera = this.localStateAccess.getCamera();
		this.gameStateWriter.setCameraData({
			x: -pos.x,
			y: -pos.y,
			zoom: camera.zoom,
		});
	}

	move(dx: number, dy: number): void {
		const camera = this.localStateAccess.getCamera();
		this.gameStateWriter.setCameraData({
			x: camera.x + (dx / camera.zoom),
			y: camera.y - (dy / camera.zoom),
			zoom: camera.zoom,
		});
	}

	zoom(d: number): void {
		const camera = this.localStateAccess.getCamera();
		const zoom = Math.max(0.01, camera.zoom - d);
		this.gameStateWriter.setCameraData({
			x: camera.x,
			y: camera.y,
			zoom: zoom,
		});
	}
}