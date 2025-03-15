export interface CommandMessage {
	type: string,
}

export interface MoveCommandMessage extends CommandMessage {
	worldObjectId: string,
	path: ({
		id: string,
		q: number,
		r: number
	})[]
}

export interface CreateSettlementCommandMessage extends CommandMessage {
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