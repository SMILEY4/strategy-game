import {HiddenType} from "../../models/common/hiddenType";
import {TileIdentifier} from "../../models/primitives/tile";
import {DetailsLogValue} from "../../models/primitives/detailLog";

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
	name: string
	country: string,
	tile: {
		id: string,
		q: number,
		r: number
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
	produced: number,
	consumed: number,
	amount: number,
	missing: number,
	details: DetailsLogEntryMessage[]
}

export interface DetailsLogEntryMessage {
	id: string,
	data: DetailsLogValueMessage[]
}

export interface DetailsLogValueMessage {
	key: string,
	type: string
}

export interface BooleanDetailsLogValueMessage extends DetailsLogValueMessage{
	type: "boolean"
	value: boolean
}

export interface NumberDetailsLogValueMessage extends DetailsLogValueMessage{
	type: "number"
	value: number
}

export interface TextDetailsLogValueMessage extends DetailsLogValueMessage{
	type: "text"
	value: string
}

export interface TileDetailsLogValueMessage extends DetailsLogValueMessage{
	type: "tile"
	value: {
		id: string
		q: number,
		r: number,
	}
}

export interface BuildingDetailsLogValueMessage extends DetailsLogValueMessage{
	type: "building"
	value: string
}

export interface ResourcesDetailsLogValueMessage extends DetailsLogValueMessage{
	type: "resources"
	value: ({type: string, amount: number})[]
}