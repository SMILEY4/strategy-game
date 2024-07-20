import {GameSessionService} from "../gamesession/gameSessionService";

/**
 * Service to handle the end of the current turn (for this player)
 */
export class TurnEndService {

	private readonly gameSessionService: GameSessionService;

	constructor(gameSessionService: GameSessionService) {
		this.gameSessionService = gameSessionService;
	}

	/**
	 * End the current turn
	 */
	public endTurn() {
		this.gameSessionService.submitTurn()
	}

}