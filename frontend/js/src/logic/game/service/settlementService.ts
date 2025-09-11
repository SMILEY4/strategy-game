import {CommandService} from "./commandService";
import {GameClient} from "../client/gameClient";
import {TileId} from "../../../models/tile/tileId";
import {WorldObjectId} from "../../../models/worldobject/worldObjectId";
import {
	CreateSettlementCommand,
	ProductionQueueAddCommand,
	ProductionQueueCancelCommand,
} from "../../../models/command/command";
import {CommandType} from "../../../models/command/commandType";
import {UID} from "../../../common/uid";
import {TileSummary} from "../../../models/tile/tileSummary";
import {SettlementSummary} from "../../../models/settlement/settlementSummary";
import {GameStateAccess} from "../../../state/gameStateAccess";
import {SettlementProductionOption} from "../../../models/settlement/settlement";


export interface SettlementService {
	/**
	 * Get a random name for a settlement
	 */
	getRandomName(): Promise<string>;
	/**
	 * Validate whether the settlement can be created.
	 * Returns a list of reasons if invalid.
	 */
	validateFounding(tile: TileId, name: string | null): string[];
	/**
	 * Create a new settlement
	 */
	foundSettlement(tile: TileSummary, worldObjectId: WorldObjectId, name: string): void;
	/**
	 * Add a new entry to the given settlements production queue
	 */
	addProduction(settlement: SettlementSummary, entry: SettlementProductionOption): void;
	/**
	 * Cancel the given entry in the given settlements production queue
	 */
	cancelProduction(settlement: SettlementSummary, entryId: string): void;
}

export class SettlementServiceImpl implements SettlementService {

	private readonly commandService: CommandService;
	private readonly client: GameClient;
	private readonly localStateAccess: GameStateAccess;

	constructor(
		commandService: CommandService,
		client: GameClient,
		localStateAccess: GameStateAccess,
	) {
		this.commandService = commandService;
		this.client = client;
		this.localStateAccess = localStateAccess;
	}


	getRandomName(): Promise<string> {
		return this.client.getRandomSettlementName();
	}


	validateFounding(tile: TileId, name: string): string[] {
		const failureReasons: string[] = [];
		if (!name) {
			failureReasons.push("Invalid name");
		}
		return failureReasons;
	}

	foundSettlement(tile: TileSummary, worldObjectId: WorldObjectId, name: string): void {
		this.commandService.addCommand<CreateSettlementCommand>({
			id: UID.generate(),
			type: CommandType.CREATE_SETTLEMENT,
			worldObjectId: worldObjectId,
			tile: tile,
			name: name,
		});
	}

	addProduction(settlement: SettlementSummary, entry: SettlementProductionOption): void {
		this.commandService.addCommand<ProductionQueueAddCommand>({
			id: UID.generate(),
			type: CommandType.PRODUCTION_QUEUE_ADD,
			settlement: settlement,
			entry: {
				type: entry.type,
				entryId: UID.generate(),
				progress: 0,
			},
		});
	}

	cancelProduction(settlement: SettlementSummary, entryId: string): void {
		const command = this.localStateAccess
			.getCommandsOfType<ProductionQueueAddCommand>(CommandType.PRODUCTION_QUEUE_ADD)
			.find(it => it.entry.entryId === entryId);
		if (command) {
			this.commandService.cancelCommand(command.id);
		} else {
			const productionQueueEntry = this.localStateAccess
				.getSettlementProductionQueue(settlement.id)
				?.find(it => it.id === entryId);
			if (productionQueueEntry) {
				this.commandService.addCommand<ProductionQueueCancelCommand>({
					id: UID.generate(),
					type: CommandType.PRODUCTION_QUEUE_CANCEL,
					settlement: settlement,
					entry: {
						type: productionQueueEntry.type,
						entryId: productionQueueEntry.id,
						progress: productionQueueEntry.progress,
					},
				});
			}
		}
	}

}