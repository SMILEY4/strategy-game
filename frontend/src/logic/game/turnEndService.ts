import {GameSessionService} from "../gamesession/gameSessionService";
import {MovementService} from "./movementService";
import {CommandRepository} from "../../state/repository/commandRepository";

/**
 * Service to handle the end of the current turn (for this player)
 */
export class TurnEndService {

	private readonly gameSessionService: GameSessionService;
	private readonly movementService: MovementService;
	private readonly commandRepository: CommandRepository;


	constructor(
		gameSessionService: GameSessionService,
		movementService: MovementService,
		commandRepository: CommandRepository,
	) {
		this.gameSessionService = gameSessionService;
		this.movementService = movementService;
		this.commandRepository = commandRepository;
	}

	/**
	 * End the current turn
	 */
	public endTurn() {
		this.movementService.cancelMovement();
		this.gameSessionService.submitTurn(this.commandRepository.getAll());
		this.commandRepository.clear();
	}

}