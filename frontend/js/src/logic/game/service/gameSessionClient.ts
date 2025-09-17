import {Game} from "../../../models/misc/game";
import {GameMessageHandler} from "./gameMessageHandler";
import {Command} from "../../../models/command/command";

/**
 * API-Client for game session operations
 */
export interface GameSessionClient {
	/**
	 * List the games of the currently logged-in user
	 */
	list(): Promise<Game[]>;
	/**
	 * Create a new game with the given name and settings
	 */
	create(name: string, seed: string | null): Promise<string>;
	/**
	 * Delete a game with the given id
	 */
	delete(game: Game.Id): Promise<void>;
	/**
	 * Join a game with the given id as a new player
	 */
	join(game: Game.Id): Promise<void>;
	/**
	 * Connect to a given game and handle received messages
	 */
	connect(game: Game.Id, handler: GameMessageHandler): Promise<void>;
	/**
	 * Disconnect from a currently connected game
	 */
	disconnect(): void;
	/**
	 * Submit commands and end the turn.
	 */
	submitTurn(commands: Command[]): void
}