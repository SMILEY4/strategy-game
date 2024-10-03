import {TileIdentifier} from "../../models/primitives/tile";

export interface CommandMessage {
	type: string,
}

export interface MoveCommandMessage extends CommandMessage {
	worldObjectId: string,
	path: TileIdentifier[]
}


export interface CreateSettlementDirectCommandMessage extends CommandMessage {
	name: string;
	tile: TileIdentifier;
}

export interface CreateSettlementWithSettlerCommandMessage extends CommandMessage {
	name: string;
	worldObjectId: string;
}

export interface ProductionQueueAddCommandMessage extends CommandMessage {
	settlementId: string,
	entryType: string
}

export interface ProductionQueueCancelCommandMessage extends CommandMessage {
	settlementId: string,
	entryId: string,
}