import {TileIdentifier} from "./tile";

export class CommandType {

	public static readonly MOVE = new CommandType("move")
	public static readonly FOUND_SETTLEMENT = new CommandType("found_settlement")

	readonly id: string;

	private constructor(id: string) {
		this.id = id;
	}
}

export interface Command {
	id: string
	type: CommandType
	worldObjectId: string | null
}

export interface MoveCommand extends Command {
	path: TileIdentifier[]
}

export interface FoundSettlementCommand extends Command {
	name: string
	tile: TileIdentifier
}