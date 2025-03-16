import {UseTileWindow} from "../../../ui/pages/ingame/windows/tile/useTileWindow";
import {UseWorldObjectWindow} from "../../../ui/pages/ingame/windows/worldobject/useWorldObjectWindow";
import {UseSettlementWindow} from "../../../ui/pages/ingame/windows/settlement/useSettlementWindow";
import {GameStateWriter} from "../../../state/gameStateWriter";
import {TileSummary} from "../../../models/tile/tileSummary";
import {WorldObject} from "../../../models/worldobject/worldObject";
import {Settlement} from "../../../models/settlement/settlement";
import {GameStateAccess} from "../../../state/gameStateAccess";
import {CanvasHandle} from "../../../common/webgl/canvasHandle";
import {Tile} from "../../../models/tile/tile";
import {Projections} from "../../../common/webgl/projections";
import {Camera} from "../../../common/webgl/camera";

export interface TileService {
	clickTile(tile: TileSummary): void;
	mouseOver(tile: TileSummary | null): void;
	pickTileAt(screenX: number, screenY: number, canvasHandle: CanvasHandle): Tile | null;
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

		const worldObjects: WorldObject[] = this.localStateAccess.getWorldObjectsAt(tile.position.q, tile.position.r)
		const settlement: Settlement | null = this.localStateAccess.getSettlementAt(tile.position.q, tile.position.r)

		let optionCount = 0;
		optionCount += settlement ? 1 : 0;
		optionCount += worldObjects.length;

		if (optionCount > 1) {
			UseTileWindow.open(tile.id);
			return;
		}
		if (worldObjects.length === 1) {
			UseWorldObjectWindow.open(worldObjects[0].id);
			return;
		}
		if (settlement) {
			UseSettlementWindow.open(settlement.id);
			return;
		}
		UseTileWindow.open(tile.id);
		return;
	}

	mouseOver(tile: TileSummary | null): void {
		if (this.localStateAccess.getHoveredTile() !== tile) {
			this.gameStateWriter.setHoveredTile(tile);
		}
	}

	pickTileAt(screenX: number, screenY: number, canvasHandle: CanvasHandle): Tile | null {
		const hexPos = Projections.screenToHex(this.camera(canvasHandle), screenX, screenY);
		return this.localStateAccess.getTileAt(hexPos.x, hexPos.y);
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