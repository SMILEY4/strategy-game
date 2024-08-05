import {HiddenType} from "../../models/hiddenType";

export interface GameStateMessage {
	meta: {
		turn: number
	},
	tiles: TileMessage[],
	countries: CountryMessage[],
	worldObjects: WorldObjectMessage[]
}

export interface TileMessage {
	identifier: {
		id: string,
		q: number,
		r: number
	},
	visibility: "UNKNOWN" | "DISCOVERED" | "VISIBLE"
	base: HiddenType<{
		terrainType: "LAND" | "WATER",
		resourceType: "NONE" | "WOOD" | "FISH" | "STONE" | "METAL",
		height: number
	}>
}

export interface CountryMessage {
	id: string,
	name: string,
	player: {
		userId: string,
		name: string
	},
	ownedByUser: boolean
}

export interface WorldObjectMessage {
	type: string,
	id: string,
	country: string,
	tile: {
		id: string,
		q: number,
		r: number
	}
}
