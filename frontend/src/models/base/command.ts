import {TileIdentifier} from "./tile";
import {ProductionQueueEntry, SettlementIdentifier} from "./Settlement";

export class CommandType {

	public static readonly MOVE = new CommandType("move")
	public static readonly CREATE_SETTLEMENT = new CommandType("create-settlement")
	public static readonly PRODUCTION_QUEUE_ADD = new CommandType("production-queue.add")
	public static readonly PRODUCTION_QUEUE_CANCEL = new CommandType("production-queue.remove-entry")


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

export interface CreateSettlement extends Command {
	name: string
	tile: TileIdentifier
}

export interface ProductionQueueAddCommand extends Command {
	settlement: SettlementIdentifier,
	entry: ProductionQueueEntry,
}

export interface ProductionQueueCancelCommand extends Command {
	settlement: SettlementIdentifier,
	entry: ProductionQueueEntry,
}