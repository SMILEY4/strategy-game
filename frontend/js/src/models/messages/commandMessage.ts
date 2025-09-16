export interface CommandMessage {
	type: string,
}

export interface MoveCommandMessage extends CommandMessage {
	worldObjectId: string,
	path: ({
		id: string,
		position: {
			q: number,
			r: number
		}
	})[]
}

export interface DisbandWorldObjectCommandMessage extends CommandMessage {
	worldObjectId: string,
}