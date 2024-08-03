import {PlayerIdentifier} from "./player";

export interface Country {
	identifier: CountryIdentifier
	player: PlayerIdentifier,
	ownedByPlayer: boolean
}

export interface CountryIdentifier {
	id: string,
	name: string
}