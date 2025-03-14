import {PlayerIdentifier} from "./player";
import {Color} from "./color";

export interface Country {
	identifier: CountryIdentifier,
	player: PlayerIdentifier,
}

export interface CountryIdentifier {
	id: string,
	name: string
	color: Color,
	isUserCountry: boolean,
}

export interface CountryOutline {
	identifier: CountryIdentifier,
}