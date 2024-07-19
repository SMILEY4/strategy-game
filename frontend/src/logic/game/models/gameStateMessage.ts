import {TileIdentifier} from "../../../models/tile";


export interface GameStateMessage {
	meta: {
		turn: number
	},
	tiles: TileMessage[],
}


export interface TileMessage {
	identifier: TileIdentifier,
}

