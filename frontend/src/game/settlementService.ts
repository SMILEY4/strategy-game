import {Tile} from "../models/primitives/tile";
import {CommandService} from "./commandService";
import {GameClient} from "./gameClient";
import {ProductionOptionAggregate, ProductionQueueEntryAggregate} from "../models/aggregates/SettlementAggregate";
import {SettlementIdentifier} from "../models/primitives/Settlement";
import {GameRepository} from "./gameRepository";
import {CommandType, ProductionQueueAddCommand} from "../models/primitives/command";
import {ProductionOptionType} from "../models/primitives/productionOptionType";

export class SettlementService {

	private readonly commandService: CommandService;
	private readonly repository: GameRepository;
	private readonly client: GameClient;

	constructor(commandService: CommandService, repository: GameRepository, client: GameClient) {
		this.commandService = commandService;
		this.repository = repository;
		this.client = client;
	}

	public getRandomName(): Promise<string> {
		return this.client.getRandomSettlementName().then(it => it.name);
	}

	public validateFounding(tile: Tile, name: string | null): string[] {
		const failureReasons: string[] = [];
		if (!name) {
			failureReasons.push("Invalid name");
		}
		return failureReasons;
	}

	public createSettlementDirect(tile: Tile, name: string) {
		this.commandService.addCreateSettlementDirectCommand(tile.identifier, name);
	}

	public createSettlementWithSettler(worldObjectId: string, tile: Tile, name: string) {
		this.commandService.addCreateSettlementWithSettlerCommand(worldObjectId, tile.identifier, name);
	}

	public addProductionQueue(settlement: SettlementIdentifier, type: string) {
		this.commandService.addProductionQueueEntry(settlement, type);
	}

	public cancelProductionQueue(settlement: SettlementIdentifier, entry: ProductionQueueEntryAggregate) {
		const commands = this.repository.getCommands()
			.filter(it => it.type === CommandType.PRODUCTION_QUEUE_ADD)
			.map(it => it as ProductionQueueAddCommand)
			.filter(it => it.entry.entryId === entry.entryId);
		if (commands.length > 0) {
			this.commandService.cancelCommand(commands[0].id);
		} else {
			this.commandService.cancelProductionQueueEntry(settlement, entry);
		}
	}

}