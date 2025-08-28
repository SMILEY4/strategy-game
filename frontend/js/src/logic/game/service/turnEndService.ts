import {GameSessionService} from "./gameSessionService";
import {MovementService} from "./movementService";
import {GameStateAccess} from "../../../state/gameStateAccess";
import {GameStateWriter} from "../../../state/gameStateWriter";

export interface TurnEndService {
	/**
	 * End the current turn and send commands to backend
	 */
	endTurn(): void;
}

export class TurnEndServiceImpl implements TurnEndService {

	private readonly gameSessionService: GameSessionService;
	private readonly movementService: MovementService;
	private readonly gameStateWriter: GameStateWriter;
	private readonly localStateAccess: GameStateAccess;

	constructor(
		gameSessionService: GameSessionService,
		movementService: MovementService,
		gameStateWriter: GameStateWriter,
		localStateAccess: GameStateAccess,
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