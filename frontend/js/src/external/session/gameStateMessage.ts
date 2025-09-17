import {HiddenType} from "../../common/hiddenType";

export interface GameStateMessage {
	game: {
		turn: number
	},
	tiles: TileMessage[],
	realms: RealmMessage[],
	worldObjects: WorldObjectMessage[],
}

export type VisibilityMsg = "UNKNOWN" | "DISCOVERED" | "VISIBLE"

export type TerrainTypeMsg = "LAND" | "WATER"

export type ResourceTypeMsg = "NONE" | "WOOD" | "FISH" | "STONE" | "METAL"

export interface TileMessage {
	identifier: {
		id: string,
		q: number,
		r: number
	},
	visibility: VisibilityMsg
	base: HiddenType<{
		terrainType: TerrainTypeMsg,
		resourceType: ResourceTypeMsg,
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