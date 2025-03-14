import {WorldObjectId} from "../worldobject/worldObjectId";
import {TileSummary} from "../tile/tileSummary";
import {SettlementSummary} from "../settlement/settlementSummary";
import {ProductionQueueEntryEntity} from "../settlement/settlementEntity";
import {CommandType} from "./commandType";

export interface Command {
	id: string
	type: CommandType
}

export interface MoveCommand extends Command {
	worldObjectId: WorldObjectId
	path: TileSummary[],
}

export interface CreateSettlementCommand extends Command {
	worldObjectId: WorldObjectId
	tile: TileSummary,
	name: string
}

export interface ProductionQueueAddCommand extends Command {
	settlement: SettlementSummary,
	entry: ProductionQueueEntryEntity,
}

export interface ProductionQueueCancelCommand extends Command {
	settlement: SettlementSummary,
	entry: ProductionQueueEntryEntity,
}