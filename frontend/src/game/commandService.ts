import {GameRepository} from "./gameRepository";
import {Command, CommandType, MoveCommand} from "../models/command";
import {UID} from "../shared/uid";
import {AudioService, AudioType} from "../shared/audioService";
import {TileIdentifier} from "../models/tile";

export class CommandService {

	private readonly repository: GameRepository;
	private readonly audioService: AudioService;

	constructor(repository: GameRepository, audioService: AudioService) {
		this.repository = repository;
		this.audioService = audioService;
	}

	public cancelCommand(commandId: string) {
		this.repository.deleteCommand(commandId);
		AudioType.WRITING_ON_PAPER.play(this.audioService);
	}

	public addCommand(command: Command) {
		this.repository.addCommand(command);
		AudioType.WRITING_ON_PAPER.play(this.audioService);
	}

	public addMovementCommand(worldObjectId: string, path: TileIdentifier[]) {
		const command: MoveCommand = {
			id: UID.generate(),
			type: CommandType.MOVE,
			worldObjectId: worldObjectId,
			path: path,
		};
		this.addCommand(command);
	}

}