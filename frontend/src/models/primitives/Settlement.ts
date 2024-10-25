import {TileIdentifier} from "./tile";
import {CountryIdentifier} from "./country";
import {Color} from "./color";
import {HiddenType} from "../common/hiddenType";
import {ProductionOption} from "./productionOption";
import {Building} from "./building";
import {DetailsLogEntry} from "./detailLog";

export interface Settlement {
	identifier: SettlementIdentifier,
	country: CountryIdentifier
	tile: TileIdentifier,
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

export interface ProductionQueueEntry {
	type: string,
	entryId: string,
	progress: number
}

export interface ResourceLedgerEntry {
	type: string,
	produced: number,
	consumed: number,
	amount: number,
	missing: number,
	details: DetailsLogEntry[]
}