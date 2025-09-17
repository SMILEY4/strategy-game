import {HiddenType} from "../../common/hiddenType";

export interface GameStateMessage {
	game: {
		turn: number
	},
	tiles: TileMessage[],
	realms: RealmMessage[],
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
}

export interface RealmMessage {
	id: string,
	name: string,
	color: {
		red: number,
		green: number,
		blue: number,
	}
	player: {
		userId: string,
		name: string
	},
	ownedByUser: boolean
}

export interface WorldObjectMessage {
	id: string,
	type: {
		group: "unit" | "?",
		name: string,
	},
	realm: {
		id: string,
		name: string,
	},
	tile: {
		id: string,
		q: number,
		r: number
	},
	components: (MoveWorldObjectComponentMessage | VisionWorldObjectComponentMessage)[],
}


interface MoveWorldObjectComponentMessage {
	type: "movement"
	maxMovement: number
}


interface VisionWorldObjectComponentMessage {
	type: "vision"
	radius: number
}