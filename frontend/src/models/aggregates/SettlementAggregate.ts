import {CountryIdentifier} from "../primitives/country";
import {TileIdentifier} from "../primitives/tile";
import {SettlementIdentifier} from "../primitives/Settlement";
import {ProductionOptionType} from "../primitives/productionOptionType";

export interface SettlementAggregate {
	identifier: SettlementIdentifier,
	country: CountryIdentifier
	tile: TileIdentifier,
	production: {
		options: ProductionOptionAggregate[],
		queue: ProductionQueueEntryAggregate[],
	}
}

export interface ProductionQueueEntryAggregate {
	id: string,
	optionType: ProductionOptionType,
	progress: number,
	isCommand: boolean
}

export interface ProductionOptionAggregate {
	type: ProductionOptionType,
	available: boolean,
	queueCount: number,
	commandCount: number,
}
