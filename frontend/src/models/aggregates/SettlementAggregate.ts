import {CountryIdentifier} from "../base/country";
import {TileIdentifier} from "../base/tile";
import {ProductionQueueEntry, ResourceLedgerEntry, SettlementIdentifier} from "../base/Settlement";
import {Building} from "../base/building";

export interface SettlementAggregate {
	identifier: SettlementIdentifier,
	country: CountryIdentifier
	tile: TileIdentifier,
	production: {
		options: ProductionOptionAggregate[],
		queue: ProductionQueueEntry[],
	},
	buildings: Building[],
	resources: ResourceLedgerEntry[]
}


export interface ProductionOptionAggregate {
	type: string,
	available: boolean,
	queueCount: number,
	commandCount: number,
}
