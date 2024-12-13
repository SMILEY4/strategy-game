import {Tile} from "../../models/base/tile";
import {CommandService} from "./commandService";
import {GameClient} from "./gameClient";
import {ProductionQueueEntry, SettlementIdentifier} from "../../models/base/Settlement";
import {CommandType, ProductionQueueAddCommand} from "../../models/base/command";
import {CommandRepository} from "../../state/repository/commandRepository";

export class SettlementService {

	private readonly commandService: CommandService;
	private readonly commandRepository: CommandRepository;
	private readonly client: GameClient;

	constructor(
		commandService: CommandService,
		client: GameClient,
		commandRepository: CommandRepository,
	) {
		this.commandService = commandService;
		this.client = client;
		this.commandRepository = commandRepository;
	}

	/**
	 * Get a random name for a settlement
	 */
	public getRandomName(): Promise<string> {
		return this.client.getRandomSettlementName().then(it => it.name);
	}

	/**
	 * Check whether the given settlement can be created
	 */
	public validateFounding(tile: Tile, name: string | null): string[] {
		const failureReasons: string[] = [];
		if (!name) {
			failureReasons.push("Invalid name");
		}
		return failureReasons;
	}

	/**
	 * Create a new settlement
	 */
	public createSettlementDirect(tile: Tile, name: string) {
		this.commandService.addCreateSettlementDirectCommand(tile.identifier, name);
	}

	/**
	 * Create a new settlement using the settler
	 */
	public createSettlementWithSettler(worldObjectId: string, tile: Tile, name: string) {
		this.commandService.addCreateSettlementWithSettlerCommand(worldObjectId, tile.identifier, name);
	}

	/**
	 * Add a new entry into the given settlement production queue
	 */
	public addProductionQueue(settlement: SettlementIdentifier, type: string) {
		this.commandService.addProductionQueueEntry(settlement, type);
	}

	/**
	 * Cancel the given production queue entry
	 */
	public cancelProductionQueue(settlement: SettlementIdentifier, entry: ProductionQueueEntry) {
		const commands = this.commandRepository
			.getAllByType<ProductionQueueAddCommand>(CommandType.PRODUCTION_QUEUE_ADD)
			.filter(it => it.entry.entryId === entry.entryId);
		if (commands.length > 0) {
			this.commandService.cancelCommand(commands[0].id);
		} else {
			this.commandService.cancelProductionQueueEntry(settlement, entry);
		}
	}

}