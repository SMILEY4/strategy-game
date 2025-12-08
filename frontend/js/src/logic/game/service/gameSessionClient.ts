import {Game} from "../../../models/misc/game";
import {GameMessageHandler} from "./gameMessageHandler";
import {Command} from "../../../models/command/command";

/**
 * API-Client for game session operations
 */
export interface GameSessionClient {
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