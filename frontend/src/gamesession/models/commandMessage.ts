import {TilePosition} from "../../models/tilePosition";

export interface CommandMessage {
	type: string,
}

export interface MoveCommandMessage extends CommandMessage {
	worldObjectId: string,
	path: TilePosition[]
}