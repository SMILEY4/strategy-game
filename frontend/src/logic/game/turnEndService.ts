import {GameSessionService} from "../session/gameSessionService";
import {MovementService} from "./movementService";
import {LocalStateAccess} from "../../state/localStateAccess";
import {GameStateWriter} from "../../state/gameStateWriter";

/**
 * Service to handle the end of the current turn (for this player)
 */
export interface TurnEndService {
	endTurn(): void;
}

export class TurnEndServiceImpl implements TurnEndService {

	private readonly gameSessionService: GameSessionService;
	private readonly movementService: MovementService;
	private readonly gameStateWriter: GameStateWriter;
	private readonly localStateAccess: LocalStateAccess;

	constructor(
		gameSessionService: GameSessionService,
		movementService: MovementService,
		gameStateWriter: GameStateWriter,
		localStateAccess: LocalStateAccess,
	) {
		this.gameSessionService = gameSessionService;
		this.movementService = movementService;
		this.gameStateWriter = gameStateWriter;
		this.localStateAccess = localStateAccess;
	}

	endTurn(): void {
		this.movementService.cancelMovement();
		this.gameSessionService.submitTurn(this.localStateAccess.getCommands());
		this.gameStateWriter.clearCommands();
		this.gameStateWriter.setTurnState("waiting")
	}

}