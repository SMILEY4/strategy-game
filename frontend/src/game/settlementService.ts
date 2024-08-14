import {Tile} from "../models/tile";
import {CommandService} from "./commandService";
import {GameClient} from "./gameClient";

export class SettlementService {

	private readonly commandService: CommandService;
	private readonly client: GameClient;

	constructor(commandService: CommandService, client: GameClient) {
		this.commandService = commandService;
		this.client = client;
	}

	public getRandomName(): Promise<string> {
		return this.client.getRandomSettlementName().then(it => it.name)
	}

	public validateFounding(tile: Tile, name: string | null): string[] {
		const failureReasons: string[] = []
		if(!name) {
			failureReasons.push("Invalid name")
		}
		// todo... add more validations
		return failureReasons
	}

	public createSettlementDirect(tile: Tile, name: string) {
		this.commandService.addCreateSettlementDirectCommand(tile.identifier, name)
	}

	public createSettlementWithSettler(worldObjectId: string, tile: Tile, name: string) {
		this.commandService.addCreateSettlementWithSettlerCommand(worldObjectId, tile.identifier, name)
	}

}