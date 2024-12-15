import {HiddenType} from "../../../common/hiddenType";

export interface GameStateMessage {
	meta: {
		turn: number
	},
	tiles: TileMessage[],
	countries: CountryMessage[],
	settlements: SettlementMessage[],
	worldObjects: WorldObjectMessage[],
	routes: RouteMessage[],
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
			settlement: string
		}
	}>,
	createSettlement: boolean
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

export interface SettlementMessage {
	id: string,
	color: {
		red: number,
		green: number,
		blue: number,
	},
	name: string
	country: string,
	tile: {
		id: string,
		q: number,
		r: number
	},
	population: {
		size: number,
		growth: HiddenType<({
			progress: number,
			details: ({
				key: string,
				amount: number
			})[]
		})>,
	},
	productionQueue: HiddenType<({
		type: string
		entryId: string
		progress: number
	})[]>,
	productionOptions: HiddenType<({
		type: string,
		availableTiles: number | null
	})[]>,
	buildings: HiddenType<({
		type: string,
		workTile: {
			requiredTerrain: string | null,
			requiredResource: string | null,
			tile: null | {
				id: string,
				q: number,
				r: number
			},
		},
		validity: {
			workTile: boolean,
			inputResources: boolean
		},
		activity: {
			consumed: ({
				type: string,
				amount: number
			})[],
			produced: ({
				type: string,
				amount: number
			})[],
			missing: ({
				type: string,
				amount: number
			})[],
		}
	})[]>,
	resources: HiddenType<ResourceLedgerEntryMessage[]>
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

export interface ResourceLedgerEntryMessage {
	type: string,
	amount: number,
	produced: {
		amount: number,
		details: ({ key: string, amount: number })[]
	},
	consumed: {
		amount: number,
		details: ({ key: string, amount: number })[]
	},
	missing: {
		amount: number,
		details: ({ key: string, amount: number })[]
	},
}

export interface RouteMessage {
	id: string,
	settlementA: string,
	settlementB: string,
	path: ({
		id: string,
		q: number,
		r: number,
	})[]
}