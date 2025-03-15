import {CameraEntity} from "../models/misc/cameraEntity";
import {TileSummary} from "../models/tile/tileSummary";
import {MapMode} from "../models/misc/mapMode";
import {MovementState} from "../models/misc/movementState";
import {GameTurnState} from "../models/misc/gameTurnState";
import {Command} from "../models/command/command";
import {CommandId} from "../models/command/commandId";
import {GameState} from "../models/misc/gameState";

export interface GameStateWriter {
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


export class GameStateWriterImpl implements GameStateWriter {
	addCommand(command: Command): void {
	}

	clearCommands(): void {
	}

	removeCommand(commandId: CommandId): void {
	}

	replaceGameState(state: GameState): void {
	}

	setCameraData(cameraData: CameraEntity): void {
	}

	setHoveredTile(tile: TileSummary | null): void {
	}

	setMovementState(state: MovementState | null): void {
	}

	setSelectedMapMode(mapMode: MapMode): void {
	}

	setSelectedTile(tile: TileSummary | null): void {
	}

	setTurnState(turnState: GameTurnState): void {
	}


}