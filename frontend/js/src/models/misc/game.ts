import {BrandedId} from "../../common/brandedId";

/**
 * Data about a game.
 */
export interface Game {
	id: Game.Id,
	name: string,
	creationTimestamp: number,
	currentTurn: number
}

export namespace Game {

	export type Id = BrandedId<string, "GameId">;

}