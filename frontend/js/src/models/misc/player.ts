import {User} from "./userId";

/**
 * A player in a game.
 */
export interface Player {
	userId: User.Id,
	name: string
}
