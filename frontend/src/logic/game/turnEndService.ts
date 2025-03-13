import {GameSessionService} from "../session/gameSessionService";
import {MovementService} from "./movementService";
import {CommandRepository} from "../../state/repository/commandRepository";
import {SessionRepository} from "../../state/repository/sessionRepository";

/**
 * Service to handle the end of the current turn (for this player)
 */
export interface TurnEndService {
	endTurn(): void;
}

export class TurnEndServiceImpl implements TurnEndService {

	private readonly gameSessionService: GameSessionService;
	private readonly movementService: MovementService;
	private readonly commandRepository: CommandRepository;
	private readonly sessionRepository: SessionRepository;


	constructor(
		gameSessionService: GameSessionService,
		movementService: MovementService,
		commandRepository: CommandRepository,
		sessionRepository: SessionRepository,
	) {
		this.gameSessionService = gameSessionService;
		this.movementService = movementService;
		this.commandRepository = commandRepository;
		this.sessionRepository = sessionRepository;
	}

	endTurn(): void {
		this.movementService.cancelMovement();
		this.gameSessionService.submitTurn(this.commandRepository.getAll());
		this.commandRepository.clear();
		this.sessionRepository.setTurnState("waiting");
	}

}