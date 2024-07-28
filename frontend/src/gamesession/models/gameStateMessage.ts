import {TileIdentifier} from "../../models/tile";


export interface GameStateMessage {
	meta: {
		turn: number
	},
	tiles: TileMessage[],
	worldObjects: WorldObjectMessage[]
}


export interface TileMessage {
	identifier: TileIdentifier,
	terrainType: "LAND" | "WATER",
	resourceType: "NONE" | "WOOD" | "FISH" | "STONE" | "METAL",
	height: number
}


export interface WorldObjectMessage {
	type: string,
	id: string,
	tile: TileIdentifier
}