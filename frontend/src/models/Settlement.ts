import {TileIdentifier} from "./tile";
import {CountryIdentifier} from "./country";

export interface Settlement {
	identifier: SettlementIdentifier,
	country: CountryIdentifier
	tile: TileIdentifier,
}

export interface SettlementIdentifier {
	id: string,
	name: string
}