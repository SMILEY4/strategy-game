import {PlayerIdentifier} from "./player";
import {Color} from "./color";

export interface Country {
	identifier: CountryIdentifier,
	player: PlayerIdentifier,
	ownedByPlayer: boolean
}

export interface CountryIdentifier {
	id: string,
	name: string
	color: Color,
}