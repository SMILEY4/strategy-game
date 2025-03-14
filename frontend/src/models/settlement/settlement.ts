import {CountryIdentifier} from "../base/country";
import {TileIdentifier} from "../base/tile";
import {HiddenType} from "../../common/hiddenType";
import {Color} from "../base/color";
import {TerrainType} from "../base/TerrainType";
import {TileResourceType} from "../base/TileResourceType";
import {SettlementSummary} from "./settlementSummary";

export interface Settlement {
	id: string,
	name: string
	color: Color,
	country: CountryIdentifier,
	tile: TileIdentifier,
	population: {
		size: HiddenType<SettlementPopulationSize>,
		growth: HiddenType<SettlementPopulationGrowth>,
	}
	routes: SettlementRoute[],
	resources: HiddenType<SettlementResource[]>,
	productionQueueActive: HiddenType<SettlementProductionQueueEntry | null>
	buildings: HiddenType<SettlementBuilding[]>
}

export interface SettlementPopulationSize {
	size: number;
}

export interface SettlementPopulationGrowth {
	totalProgress: number,
	lastProgress: number,
	expectedPopulationSizeChange: number,
	details: ({
		key: string,
		amount: number
	})[]
}

export interface SettlementRoute {
	id: string,
	targetCountry: CountryIdentifier,
	targetSettlement: SettlementSummary,
}

export interface SettlementResource {
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

export interface SettlementProductionQueueEntry {
	type: string,
	id: string,
	progress: number,
	isCommand: boolean
}

export interface SettlementBuilding {
	type: string,
	workTile: {
		requiredTerrain: TerrainType | null,
		requiredResource: TileResourceType | null,
		tile: TileIdentifier | null
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
}

export interface SettlementProductionOption {
	type: string,
	available: boolean,
	queueCount: number,
	commandCount: number
}