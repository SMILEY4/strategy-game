import {TileIdentifier} from "./tile";

export class CommandType {

	public static readonly MOVE = new CommandType("move")
	public static readonly CREATE_SETTLEMENT_WITH_SETTLER = new CommandType("create-settlement-settler")

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

export interface CreateSettlementWithSettlerCommand extends Command {
	name: string
	tile: TileIdentifier
}