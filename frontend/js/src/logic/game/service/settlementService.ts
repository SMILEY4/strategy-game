import {Tile} from "../../../models/tile/tile";
import {WorldObject} from "../../../models/worldobject/worldObject";
import {TileSummary} from "../../../models/tile/tileSummary";
import {GameClient} from "./gameClient";
import {CommandService} from "./commandService";
import {Command} from "../../../models/command/command";
import {GameStateAccess} from "../../../state/gameStateAccess";
import {GameStateWriter} from "../../../state/gameStateWriter";
import {HexUtils} from "../../../common/hexUtils";
import {TileService} from "./tileService";

export interface SettlementService {
	/**
	 * Start mode for creating a new settlement.
	 */
	beginCreateSettlement(worldObjectId: WorldObject.Id): void;
	/**
	 * Cancel mode for creating a new settlement.
	 */
	cancelCreateSettlement(): void;
	/**
	 * Provides a randomly generated name for a settlement.
	 */
	getRandomSettlementName(): Promise<string>;
	/**
	 * Validate before creating a settlement. Return errors as list of strings.
	 */
	validateCreateSettlement(tileId: Tile.Id, worldObjectId: WorldObject.Id, name: string): string[];
	/**
	 * Create a new settlement
	 */
	createSettlement(tile: TileSummary, worldObjectId: WorldObject.Id, name: string): void;
}

export class SettlementServiceImpl implements SettlementService {

	constructor(
		private readonly gameClient: GameClient,
		private readonly commandService: CommandService,
		private readonly gameStateAccess: GameStateAccess,
		private readonly gameStateWriter: GameStateWriter,
		private readonly tileService: TileService,
	) {
	}

	// TODO: merge old and new system
	//  old: state (name,worldObject,...) in ui useCreateSettlementWindowHook, just called "service.create" and done
	//  new: state in persistence (move all state for intermediate "modes" like move & create settlement there); service reads and writes to that; properly use tile selection system

	beginCreateSettlement(worldObjectId: WorldObject.Id): void {
		const worldObject = this.gameStateAccess.getWorldObjectSummary(worldObjectId);
		if (!worldObject) {
			return;
		}

		this.gameStateWriter.setCreateSettlementState({// todo
			worldObjectId: worldObjectId,
			name: null,
			tile: null,
		})

		const tiles = this.findValidTiles(worldObject.tile.position);
		this.tileService.selectTile(tiles).then(selectedTile => {
			if(selectedTile) {
				const state = this.gameStateAccess.getCurrentCreateSettlementState();// todo
				this.gameStateWriter.setCreateSettlementState({
					...state,
					tile: selectedTile,
				})
			}
		});
	}

	cancelCreateSettlement() {
		this.gameStateWriter.setHighlightedTiles([]);
	}

	getRandomSettlementName(): Promise<string> {
		return this.gameClient.getRandomSettlementName();
	}

	validateCreateSettlement(tileId: Tile.Id, worldObjectId: WorldObject.Id, name: string): string[] {
		const failureReasons: string[] = [];
		if (!name) {
			failureReasons.push("Invalid name");
		}
		return failureReasons;
	}

	createSettlement(tile: TileSummary, worldObjectId: WorldObject.Id, name: string): void {
		const state = this.gameStateAccess.getCurrentCreateSettlementState(); // todo
		this.commandService.addCommand({
			type: Command.Type.CreateSettlement,
			id: Command.genId(),
			worldObjectId: worldObjectId,
			name: name,
			tile: tile,
		});
		this.gameStateWriter.setHighlightedTiles([]);
	}

	private findValidTiles(tile: Tile.Position): Tile.Position[] {
		return HexUtils.getPositionsRadius(tile.q, tile.r, 1);
	}

}
