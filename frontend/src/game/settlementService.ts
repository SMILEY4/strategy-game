import {Tile} from "../models/tile";
import {CommandService} from "./commandService";

export class SettlementService {

	private readonly commandService: CommandService;

	constructor(commandService: CommandService) {
		this.commandService = commandService;
	}

	public validateFounding(tile: Tile, name: string | null): string[] {
		const failureReasons: string[] = []
		if(!name) {
			failureReasons.push("Invalid name")
		}
		// todo... add more validations
		return failureReasons
	}

	public createSettlementWithSettler(worldObjectId: string, tile: Tile, name: string) {
		this.commandService.addCreateSettlementCommandWithSettler(worldObjectId, tile.identifier, name)
	}

}