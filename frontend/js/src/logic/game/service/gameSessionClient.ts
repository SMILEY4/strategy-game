import {GameSessionData} from "../../../models/misc/gameSessionData";
import {GameMessageHandler} from "./gameMessageHandler";
import {Command} from "../../../models/command/command";

/**
 * API-Client for game session operations
 */
export interface GameSessionClient {
	/**
	 * List the games of the currently logged-in user
	 */
	list(): Promise<GameSessionData[]>;
	/**
	 * Create a new game with the given name and settings
	 */
	create(name: string, seed: string | null): Promise<string>;
	/**
	 * Delete a game with the given id
	 */
	delete(gameId: string): Promise<void>;
	/**
	 * Join a game with the given id as a new player
	 */
	join(gameId: string): Promise<void>;
	/**
	 * Connect to a given game and handle received messages
	 */
	connect(gameId: string, handler: GameMessageHandler): Promise<void>;
	/**
	 * Disconnect from a currently connected game
	 */
	disconnect(): void;
	/**
	 * Submit commands and end the turn.
	 */
	submitTurn(commands: Command[]): void
}