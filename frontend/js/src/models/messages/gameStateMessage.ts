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

export type WorldObjectTypeGroupMsg = "unit" | "tile-improvement" | "settlement"

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
	metaProperties: {
		seed: number
	}
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
		group: WorldObjectTypeGroupMsg,
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
	components: (MoveWorldObjectComponentMessage | VisionWorldObjectComponentMessage | BuilderWorldObjectComponentMessage | SettlementSpawnerWorldObjectComponentMessage)[],
}


interface MoveWorldObjectComponentMessage {
	type: "movement";
	maxMovement: number;
}


interface VisionWorldObjectComponentMessage {
	type: "vision";
	radius: number;
}

interface BuilderWorldObjectComponentMessage {
	type: "builder";
	maxUses: number;
	remainingUses: number;
	options: ({
		type: string,
		available: boolean
	})[]
}

interface SettlementSpawnerWorldObjectComponentMessage {
	type: "settlementSpawner";
}