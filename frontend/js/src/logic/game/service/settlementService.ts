import {Tile} from "../../../models/tile/tile";
import {WorldObject} from "../../../models/worldobject/worldObject";
import {TileSummary} from "../../../models/tile/tileSummary";
import {GameClient} from "./gameClient";
import {CommandService} from "./commandService";
import {Command} from "../../../models/command/command";
import {AudioType} from "../../../common/audioService";

export interface SettlementService {
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
	) {
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
		this.commandService.addCommand({
			type: Command.Type.CreateSettlement,
			id: Command.genId(),
			worldObjectId: worldObjectId,
			name: name,
			tile: tile,
		});
	}

}
