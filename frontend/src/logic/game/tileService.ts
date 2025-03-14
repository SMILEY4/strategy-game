import {UseTileWindow} from "../../ui/pages/ingame/windows/tile/useTileWindow";
import {UseWorldObjectWindow} from "../../ui/pages/ingame/windows/worldobject/useWorldObjectWindow";
import {UseSettlementWindow} from "../../ui/pages/ingame/windows/settlement/useSettlementWindow";
import {GameStateWriter} from "../../state/gameStateWriter";
import {LocalTileDataAccess} from "../../state/access/localTileDataAccess";
import {TileSummary} from "../../models/tile/tileSummary";
import {WorldObject} from "../../models/worldobject/worldObject";
import {Settlement} from "../../models/settlement/settlement";

export interface TileService {
	clickTile(tile: TileSummary): void;
	mouseOver(tile: TileSummary | null): void;
}

export class TileServiceImpl implements TileService {

	private readonly gameStateWriter: GameStateWriter;
	private readonly localTileDataAccess: LocalTileDataAccess;

	constructor(gameStateWriter: GameStateWriter, localTileDataAccess: LocalTileDataAccess) {
		this.gameStateWriter = gameStateWriter;
		this.localTileDataAccess = localTileDataAccess;
	}

	clickTile(tile: TileSummary): void {
		const worldObjects: WorldObject[] = []; // todo
		const settlement: Settlement | null = null as Settlement | null; // todo

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
		if (this.localTileDataAccess.getHovered() !== tile) {
			this.gameStateWriter.setHoveredTile(tile);
		}
	}

}