import {TileIdentifier} from "./tile";
import {CountryIdentifier} from "./country";
import {Color} from "./color";
import {HiddenType} from "../common/hiddenType";
import {ProductionOptionType} from "./productionOptionType";

export interface Settlement {
	identifier: SettlementIdentifier,
	country: CountryIdentifier
	tile: TileIdentifier,
	productionQueue: HiddenType<ProductionQueueEntry[]>,
	productionOptions: HiddenType<ProductionOptionType[]>,
}

export interface SettlementIdentifier {
	id: string,
	name: string
	color: Color,
}

export interface ProductionQueueEntry {
	option: ProductionOptionType
	entryId: string,
	progress: number
}