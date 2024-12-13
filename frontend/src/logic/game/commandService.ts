import {
	Command,
	CommandType,
	CreateSettlementWithSettlerCommand,
	MoveCommand,
	ProductionQueueAddCommand,
	ProductionQueueCancelCommand,
} from "../../models/base/command";
import {UID} from "../../common/uid";
import {AudioService, AudioType} from "../../common/audioService";
import {TileIdentifier} from "../../models/base/tile";
import {ProductionQueueEntry, SettlementIdentifier} from "../../models/base/Settlement";
import {CommandRepository} from "../../state/repository/commandRepository";

export class CommandService {

	private readonly commandRepository: CommandRepository;
	private readonly audioService: AudioService;

	constructor(audioService: AudioService, commandRepository: CommandRepository) {
		this.audioService = audioService;
		this.commandRepository = commandRepository;
	}

	/**
	 * Add a new command to move the given world object along the given path
	 */
	public addMovementCommand(worldObjectId: string, path: TileIdentifier[]) {
		const command: MoveCommand = {
			id: UID.generate(),
			type: CommandType.MOVE,
			worldObjectId: worldObjectId,
			path: path,
		};
		this.addCommand(command);
	}

	/**
	 * Add a new command to create a new settlement
	 */
	public addCreateSettlementDirectCommand(tile: TileIdentifier, name: string) {
		const command: CreateSettlementWithSettlerCommand = {
			id: UID.generate(),
			type: CommandType.CREATE_SETTLEMENT_DIRECT,
			worldObjectId: null,
			tile: tile,
			name: name,
		};
		this.addCommand(command);
	}

	/**
	 * Add a new command to create a new settlement using the given settler
	 */
	public addCreateSettlementWithSettlerCommand(worldObjectId: string, tile: TileIdentifier, name: string) {
		const command: CreateSettlementWithSettlerCommand = {
			id: UID.generate(),
			type: CommandType.CREATE_SETTLEMENT_WITH_SETTLER,
			worldObjectId: worldObjectId,
			tile: tile,
			name: name,
		};
		this.addCommand(command);
	}

	/**
	 * Add a new command to queue a new production queue entry
	 */
	public addProductionQueueEntry(settlementId: SettlementIdentifier, type: string) {
		const cmdId = UID.generate();
		const command: ProductionQueueAddCommand = {
			id: cmdId,
			type: CommandType.PRODUCTION_QUEUE_ADD,
			worldObjectId: null,
			settlement: settlementId,
			entry: {
				type: type,
				entryId: cmdId,
				progress: 0,
				isCommand: true,
			},
		};
		this.addCommand(command);
	}

	/**
	 * Add a new command to cancel the given entry in the production queue
	 */
	public cancelProductionQueueEntry(settlementId: SettlementIdentifier, entry: ProductionQueueEntry) {
		const command: ProductionQueueCancelCommand = {
			id: UID.generate(),
			type: CommandType.PRODUCTION_QUEUE_CANCEL,
			worldObjectId: null,
			settlement: settlementId,
			entry: entry,
		};
		this.addCommand(command);
	}

	/**
	 * Cancel the given command
	 */
	public cancelCommand(commandId: string) {
		this.commandRepository.remove(commandId);
		AudioType.WRITING_ON_PAPER.play(this.audioService);
	}

	private addCommand(command: Command) {
		this.commandRepository.add(command);
		AudioType.WRITING_ON_PAPER.play(this.audioService);
	}

}