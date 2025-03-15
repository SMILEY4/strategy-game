import {CameraEntity} from "../models/misc/cameraEntity";
import {TileSummary} from "../models/tile/tileSummary";
import {MapMode} from "../models/misc/mapMode";
import {MovementState} from "../models/misc/movementState";
import {GameTurnState} from "../models/misc/gameTurnState";
import {Command} from "../models/command/command";
import {CommandId} from "../models/command/commandId";
import {GameState} from "../models/misc/gameState";
import {GameSessionState} from "../models/misc/gameSessionState";

export interface GameStateWriter {
	setAuthToken(token: string | null): void
	setGameSessionState(state: GameSessionState): void;
	setTurnState(state: GameTurnState): void;
	setCurrentTurn(turn: number): void
	setSelectedTile(tile: TileSummary | null): void;
	setHoveredTile(tile: TileSummary | null): void;
	setCameraData(cameraData: CameraEntity): void;
	setSelectedMapMode(mapMode: MapMode): void;
	setMovementState(state: MovementState | null): void
	clearCommands(): void;
	setTurnState(turnState: GameTurnState): void;
	addCommand(command: Command): void
	removeCommand(commandId: CommandId): void
	replaceGameState(state: GameState): void
}


export class GameStateWriterImpl implements GameStateWriter { // todo

	addCommand(command: Command): void {
	}

	clearCommands(): void {
	}

	removeCommand(commandId: CommandId): void {
	}

	replaceGameState(state: GameState): void {
	}

	setAuthToken(token: string | null): void {
	}

	setCameraData(cameraData: CameraEntity): void {
	}

	setCurrentTurn(turn: number): void {
	}

	setGameSessionState(state: GameSessionState): void {
	}

	setHoveredTile(tile: TileSummary | null): void {
	}

	setMovementState(state: MovementState | null): void {
	}

	setSelectedMapMode(mapMode: MapMode): void {
	}

	setSelectedTile(tile: TileSummary | null): void {
	}

	setTurnState(state: GameTurnState): void {
	}


}