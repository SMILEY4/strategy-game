import {WorldObject} from "../../models/base/worldObject";
import {Settlement} from "../../models/base/Settlement";
import {UseTileWindow} from "../../ui/pages/ingame/windows/tile/useTileWindow";
import {UseWorldObjectWindow} from "../../ui/pages/ingame/windows/worldobject/useWorldObjectWindow";
import {UseSettlementWindow} from "../../ui/pages/ingame/windows/settlement/useSettlementWindow";
import {GameStateWriter} from "../../state/gameStateWriter";
import {LocalTileDataAccess} from "../../state/local/access/localTileDataAccess";
import {LocalTileIdentifier} from "../../state/local/localTile";

export interface TileService {
	clickTile(tile: LocalTileIdentifier): void;
	mouseOver(tile: LocalTileIdentifier | null): void;
}

export class TileServiceImpl implements TileService {

	private readonly gameStateWriter: GameStateWriter;
	private readonly localTileDataAccess: LocalTileDataAccess;

	constructor(gameStateWriter: GameStateWriter, localTileDataAccess: LocalTileDataAccess) {
		this.gameStateWriter = gameStateWriter;
		this.localTileDataAccess = localTileDataAccess;
	}

	clickTile(tile: LocalTileIdentifier): void {
		const worldObjects: WorldObject[] = []; // todo
		const settlement: Settlement | null = null as Settlement | null; // todo

		let optionCount = 0;
		optionCount += settlement ? 1 : 0;
		optionCount += worldObjects.length;

		if (optionCount > 1) {
			UseTileWindow.open(tile);
			return;
		}
		if (worldObjects.length === 1) {
			UseWorldObjectWindow.open(worldObjects[0].identifier.id);
			return;
		}
		if (settlement) {
			UseSettlementWindow.open(settlement.identifier.id);
			return;
		}
		UseTileWindow.open(tile);
		return;
	}

	mouseOver(tile: LocalTileIdentifier | null): void {
		if (this.localTileDataAccess.getIdHovered() !== tile) {
			this.gameStateWriter.setHoveredTile(tile);
		}
	}

}