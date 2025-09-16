import {WorldObjectId} from "../worldobject/worldObjectId";
import {TileSummary} from "../tile/tileSummary";
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


export interface DisbandCommand extends Command {
	worldObjectId: WorldObjectId
}
