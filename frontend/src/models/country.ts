import {PlayerIdentifier} from "./player";

export interface Country {
	identifier: CountryIdentifier
	player: PlayerIdentifier
}

export interface CountryIdentifier {
	id: string,
	name: string
}