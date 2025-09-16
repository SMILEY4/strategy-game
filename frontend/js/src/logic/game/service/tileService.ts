import {UseTileWindow} from "../../../ui/pages/ingame/windows/tile/useTileWindow";
import {GameStateWriter} from "../../../state/gameStateWriter";
import {TileSummary} from "../../../models/tile/tileSummary";
import {GameStateAccess} from "../../../state/gameStateAccess";
import {CanvasHandle} from "../../../common/webgl/canvasHandle";
import {Projections} from "../../../common/webgl/projections";
import {Camera} from "../../../common/webgl/camera";
import {WorldObjectSummary} from "../../../models/worldobject/worldObjectSummary";
import {UseUnitWindow} from "../../../ui/pages/ingame/windows/unit/useUnitWindow";

export interface TileService {
	/**
	 * Handle a click-event on the given tile
	 */
	clickTile(tile: TileSummary): void;
	/**
	 * Handle a mouse-over event on the given tile
	 */
	mouseOver(tile: TileSummary | null): void;
	/**
	 * Return the tile at the given screen position
	 */
	pickTileAt(screenX: number, screenY: number, canvasHandle: CanvasHandle): TileSummary | null;
}

export class TileServiceImpl implements TileService {

	private readonly localStateAccess: GameStateAccess;
	private readonly gameStateWriter: GameStateWriter;

	constructor(localStateAccess: GameStateAccess, gameStateWriter: GameStateWriter) {
		this.localStateAccess = localStateAccess;
		this.gameStateWriter = gameStateWriter;
	}

	clickTile(tile: TileSummary): void {

		this.gameStateWriter.setSelectedTile(tile)

		const worldObjects: WorldObjectSummary[] = this.localStateAccess.getWorldObjectSummariesAt(tile.position.q, tile.position.r)

		if (worldObjects.length > 1) {
			UseTileWindow.open(tile.id);
			return;
		}
		if (worldObjects.length === 1) {
			UseUnitWindow.open(worldObjects[0].id);
			return;
		}
		UseTileWindow.open(tile.id);
	}

	mouseOver(tile: TileSummary | null): void {
		if (this.localStateAccess.getHoveredTile() !== tile) {
			this.gameStateWriter.setHoveredTile(tile);
		}
	}

	pickTileAt(screenX: number, screenY: number, canvasHandle: CanvasHandle): TileSummary | null {
		const hexPos = Projections.screenToHex(this.camera(canvasHandle), screenX, screenY);
		return this.localStateAccess.getTileSummaryAt(hexPos.x, hexPos.y);
	}

	private camera(canvasHandle: CanvasHandle): Camera {
		const cameraData = this.localStateAccess.getCamera();
		return Camera.create(
			cameraData,
			canvasHandle.getCanvasWidth(), canvasHandle.getCanvasHeight(),
			canvasHandle.getClientWidth(), canvasHandle.getClientHeight(),
		);
	}

}