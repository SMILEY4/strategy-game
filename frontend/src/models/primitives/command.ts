import {TileIdentifier} from "./tile";
import {SettlementIdentifier} from "./Settlement";
import {ProductionQueueEntryAggregate} from "../aggregates/SettlementAggregate";

export class CommandType {

	public static readonly MOVE = new CommandType("move")
	public static readonly CREATE_SETTLEMENT_WITH_SETTLER = new CommandType("create-settlement-settler")
	public static readonly CREATE_SETTLEMENT_DIRECT = new CommandType("create-settlement-direct")
	public static readonly PRODUCTION_QUEUE_ADD = new CommandType("production-queue.add.settler") // todo: id naming
	public static readonly PRODUCTION_QUEUE_CANCEL = new CommandType("production-queue.remove-entry") // todo: id naming


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

export interface CreateSettlementDirectCommand extends Command {
	name: string
	tile: TileIdentifier
}

export interface ProductionQueueAddCommand extends Command {
	settlement: SettlementIdentifier,
	entry: ProductionQueueEntryAggregate,
}

export interface ProductionQueueCancelCommand extends Command {
	settlement: SettlementIdentifier,
	entry: ProductionQueueEntryAggregate,
}