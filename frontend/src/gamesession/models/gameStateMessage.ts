import {HiddenType} from "../../models/hiddenType";

export interface GameStateMessage {
	meta: {
		turn: number
	},
	tiles: TileMessage[],
	countries: CountryMessage[],
	provinces: ProvinceMessage[]
	settlements: SettlementMessage[],
	worldObjects: WorldObjectMessage[],
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
	}>,
	political: HiddenType<{
		controlledBy: null | {
			country: string,
			province: string,
			settlement: string
		}
	}>,
	createSettlement: {
		settler: boolean
		direct: boolean
	}
}

export interface CountryMessage {
	id: string,
	name: string,
	color: {
		red: number,
		green: number,
		blue: number,
	},
	player: {
		userId: string,
		name: string
	},
	ownedByUser: boolean
}

export interface ProvinceMessage {
	id: string,
	color: {
		red: number,
		green: number,
		blue: number,
	},
	settlements: string[]
}

export interface SettlementMessage {
	id: string,
	color: {
		red: number,
		green: number,
		blue: number,
	},
	country: string,
	tile: {
		id: string,
		q: number,
		r: number
	},
	name: string
}

export interface WorldObjectMessage {
	type: string,
	id: string,
	country: string,
	tile: {
		id: string,
		q: number,
		r: number
	},
	maxMovement: number,
}
