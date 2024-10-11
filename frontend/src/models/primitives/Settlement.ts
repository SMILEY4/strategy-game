import {TileIdentifier} from "./tile";
import {CountryIdentifier} from "./country";
import {Color} from "./color";
import {HiddenType} from "../common/hiddenType";
import {ProductionOption} from "./productionOption";
import {Building} from "./building";

export interface Settlement {
	identifier: SettlementIdentifier,
	country: CountryIdentifier
	tile: TileIdentifier,
	productionQueue: HiddenType<ProductionQueueEntry[]>,
	productionOptions: HiddenType<ProductionOption[]>,
	buildings: HiddenType<Building[]>
}

export interface SettlementIdentifier {
	id: string,
	name: string
	color: Color,
}

export interface ProductionQueueEntry {
	type: string,
	entryId: string,
	progress: number
}