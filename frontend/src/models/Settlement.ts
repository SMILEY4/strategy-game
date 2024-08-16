import {TileIdentifier} from "./tile";
import {CountryIdentifier} from "./country";
import {Color} from "./color";

export interface Settlement {
	identifier: SettlementIdentifier,
	country: CountryIdentifier
	tile: TileIdentifier,
}

export interface SettlementIdentifier {
	id: string,
	name: string
	color: Color,
}