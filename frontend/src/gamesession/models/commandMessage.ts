import {TileIdentifier} from "../../models/tile";

export interface CommandMessage {
	type: string,
}

export interface MoveCommandMessage extends CommandMessage {
	worldObjectId: string,
	path: TileIdentifier[]
}