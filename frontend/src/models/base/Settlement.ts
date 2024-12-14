import {TileIdentifier} from "./tile";
import {CountryIdentifier} from "./country";
import {Color} from "./color";
import {HiddenType} from "../../common/hiddenType";
import {ProductionOption} from "./productionOption";
import {Building} from "./building";

export interface Settlement {
	identifier: SettlementIdentifier,
	country: CountryIdentifier
	tile: TileIdentifier,
	population: SettlementPopulation,
	productionQueue: HiddenType<ProductionQueueEntry[]>,
	productionOptions: HiddenType<ProductionOption[]>,
	buildings: HiddenType<Building[]>
	resources: HiddenType<ResourceLedgerEntry[]>
}

export interface SettlementIdentifier {
	id: string,
	name: string
	color: Color,
}

export interface SettlementPopulation {
	size: number,
	growth: HiddenType<({
		progress: number,
		details: ({
			key: string,
			amount: number
		})[]
	})>,
}

export interface ProductionQueueEntry {
	type: string,
	entryId: string,
	progress: number,
	isCommand: boolean
}

export interface ResourceLedgerEntry {
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