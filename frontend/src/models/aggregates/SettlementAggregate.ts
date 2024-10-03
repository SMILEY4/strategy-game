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
	buildings: Building[]
}

export interface ProductionQueueEntryAggregate {
	type: string,
	entryId: string,
	progress: number
	isCommand: boolean
}

export interface ProductionOptionAggregate {
	type: string,
	queueCount: number,
	commandCount: number,
}
