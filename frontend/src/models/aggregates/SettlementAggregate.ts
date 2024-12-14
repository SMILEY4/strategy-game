import {CountryIdentifier} from "../base/country";
import {TileIdentifier} from "../base/tile";
import {
	ProductionQueueEntry,
	ResourceLedgerEntry,
	SettlementIdentifier,
	SettlementPopulation,
} from "../base/Settlement";
import {Building} from "../base/building";
import {Route} from "../base/route";

export interface SettlementAggregate {
	identifier: SettlementIdentifier,
	country: CountryIdentifier
	tile: TileIdentifier,
	population: SettlementPopulation,
	production: {
		options: ProductionOptionAggregate[],
		queue: ProductionQueueEntry[],
	},
	buildings: Building[],
	resources: ResourceLedgerEntry[],
	routes: Route[]
}


export interface ProductionOptionAggregate {
	type: string,
	available: boolean,
	queueCount: number,
	commandCount: number,
}
