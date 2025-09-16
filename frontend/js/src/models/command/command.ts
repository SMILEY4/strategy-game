import {WorldObjectId} from "../worldobject/worldObjectId";
import {TileSummary} from "../tile/tileSummary";
import {SettlementSummary} from "../settlement/settlementSummary";
import {ProductionQueueEntryEntity} from "../settlement/settlementEntity";
import {CommandType} from "./commandType";
import {CommandId} from "./commandId";

export interface Command {
	id: CommandId
	type: CommandType
}

export interface MoveCommand extends Command {
	worldObjectId: WorldObjectId
	path: TileSummary[],
}
