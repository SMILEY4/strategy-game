import {CountryIdentifier} from "../primitives/country";
import {TileIdentifier} from "../primitives/tile";
import {SettlementIdentifier} from "../primitives/Settlement";

export interface SettlementAggregate {
	identifier: SettlementIdentifier,
	country: CountryIdentifier
	tile: TileIdentifier,
	production: {
		options: ProductionOptionAggregate[],
		queue: ProductionQueueEntryAggregate[],
	},
	buildings: BuildingAggregate[],
	resources: ResourceLedgerEntryAggregate[]
}

export interface ProductionQueueEntryAggregate {
	type: string,
	entryId: string,
	progress: number
	isCommand: boolean
}

export interface ProductionOptionAggregate {
	type: string,
	available: boolean,
	queueCount: number,
	commandCount: number,
}

export interface BuildingAggregate {
	type: string,
	active: boolean,
	workedTile: TileIdentifier | null,
	consumed: ({type: string, amount: number})[],
	produced: ({type: string, amount: number})[]
	missing: ({type: string, amount: number})[]
	missingWorkTile: boolean,
}

export interface ResourceLedgerEntryAggregate {
	type: string,
	amount: number,
	produced: {
		amount: number,
		details: ({
			key: string
			amount: number,
		})[]
	},
	consumed: {
		amount: number,
		details: ({
			key: string
			amount: number,
		})[]
	},
	missing: {
		amount: number,
		details: ({
			key: string
			amount: number,
		})[]
	},
}
