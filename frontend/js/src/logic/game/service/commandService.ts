import {Command} from "../../../models/command/command";
import {GameStateWriter} from "../../../state/gameStateWriter";

export interface CommandService {
	/**
	 * Add the given command
	 */
	addCommand<T extends Command>(command: T): void;
	/**
	 * Cancel the command with the given id
	 */
	cancelCommand(id: Command.Id): void;
}

export class CommandServiceImpl implements CommandService {

	private gameStateWriter: GameStateWriter;

	constructor(gameStateWriter: GameStateWriter) {
		this.gameStateWriter = gameStateWriter;
	}

	addCommand<T extends Command>(command: T): void {
		this.gameStateWriter.addCommand(command);
	}

	cancelCommand(id: Command.Id): void {
		this.gameStateWriter.removeCommand(id);
	}

}