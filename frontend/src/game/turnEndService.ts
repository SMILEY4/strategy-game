import {GameSessionService} from "../gamesession/gameSessionService";
import {MovementService} from "./movementService";

/**
 * Service to handle the end of the current turn (for this player)
 */
export class TurnEndService {

	private readonly gameSessionService: GameSessionService;
	private readonly movementService: MovementService;


	constructor(gameSessionService: GameSessionService, movementService: MovementService) {
		this.gameSessionService = gameSessionService;
		this.movementService = movementService;
	}

	/**
	 * End the current turn
	 */
	public endTurn() {
		this.gameSessionService.submitTurn()
		this.movementService.cancelMovement()
	}

}