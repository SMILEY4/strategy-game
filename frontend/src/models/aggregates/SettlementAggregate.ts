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
import {HiddenType} from "../../common/hiddenType";

export interface SettlementAggregate {
	identifier: SettlementIdentifier,
	country: CountryIdentifier
	tile: TileIdentifier,
	population: SettlementPopulation,
	production: {
		options: ProductionOptionAggregate[],
		queue: HiddenType<ProductionQueueEntry[]>,
	},
	buildings: HiddenType<Building[]>,
	resources: HiddenType<ResourceLedgerEntry[]>,
	routes: RouteAggregate[]
}


export interface ProductionOptionAggregate {
	type: string,
	available: boolean,
	queueCount: number,
	commandCount: number,
}

export interface RouteAggregate {
	id: string,
	targetSettlement: SettlementIdentifier,
	targetCountry: CountryIdentifier,
	path: TileIdentifier[]
}
