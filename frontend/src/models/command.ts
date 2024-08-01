import {TileIdentifier} from "./tile";

export class CommandType {

	public static readonly MOVE = new CommandType("move")

	readonly id: string;

	private constructor(id: string) {
		this.id = id;
	}
}

export interface Command {
	id: string
	type: CommandType
}

export interface MoveCommand extends Command {
	worldObjectId: string,
	path: TileIdentifier[]
}