import {GameSessionService} from "../gamesession/gameSessionService";
import {MovementService} from "./movementService";
import {GameRepository} from "./gameRepository";

/**
 * Service to handle the end of the current turn (for this player)
 */
export class TurnEndService {

	private readonly gameSessionService: GameSessionService;
	private readonly gameRepository: GameRepository;
	private readonly movementService: MovementService;


	constructor(gameSessionService: GameSessionService, gameRepository: GameRepository, movementService: MovementService) {
		this.gameSessionService = gameSessionService;
		this.gameRepository = gameRepository;
		this.movementService = movementService;
	}

	/**
	 * End the current turn
	 */
	public endTurn() {
		this.movementService.cancelMovement()
		this.gameSessionService.submitTurn(this.gameRepository.getCommands())
		this.gameRepository.clearCommands()
	}

}