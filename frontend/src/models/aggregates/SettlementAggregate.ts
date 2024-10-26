import {CountryIdentifier} from "../primitives/country";
import {TileIdentifier} from "../primitives/tile";
import {SettlementIdentifier} from "../primitives/Settlement";
import {Building} from "../primitives/building";

export interface SettlementAggregate {
	identifier: SettlementIdentifier,
	country: CountryIdentifier
	tile: TileIdentifier,
	production: {
		options: ProductionOptionAggregate[],
		queue: ProductionQueueEntryAggregate[],
	},
	buildings: Building[],
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
