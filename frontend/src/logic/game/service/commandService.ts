import {CommandId} from "../../../models/command/commandId";
import {Command} from "../../../models/command/command";
import {GameStateWriter} from "../../../state/gameStateWriter";

export interface CommandService {
	cancelCommand(id: CommandId): void;
	addCommand<T extends Command>(command: T): void;
}

export class CommandServiceImpl implements CommandService {

	private gameStateWriter: GameStateWriter;

	constructor(gameStateWriter: GameStateWriter) {
		this.gameStateWriter = gameStateWriter;
	}

	addCommand<T extends Command>(command: T): void {
		this.gameStateWriter.addCommand(command);
	}

	cancelCommand(id: CommandId): void {
		this.gameStateWriter.removeCommand(id);
	}

}