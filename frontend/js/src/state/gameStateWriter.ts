import {CameraEntity} from "../models/misc/cameraEntity";
import {TileSummary} from "../models/tile/tileSummary";
import {MapMode} from "../models/misc/mapMode";
import {MovementState} from "../models/misc/movementState";
import {GameTurnState} from "../models/misc/gameTurnState";
import {Command} from "../models/command/command";
import {CommandId} from "../models/command/commandId";
import {GameState} from "../models/misc/gameState";
import {GameSessionState} from "../models/misc/gameSessionState";
import {CameraDatabase} from "./database/cameraDatabase";
import {GameSessionDatabase} from "./database/gameSessionDatabase";
import {CommandDatabase} from "./database/commandDatabase";
import {MovementModeState} from "./database/movementModeState";
import {Transaction} from "../common/db/database/transaction";
import {TileDatabase} from "./database/tileDatabase";
import {WorldObjectDatabase} from "./database/worldObjectDatabase";
import {RealmDatabase} from "./database/realmDatabase";

export interface GameStateWriter {
	setGameSessionState(state: GameSessionState): void;
	setTurnState(state: GameTurnState): void;
	setCurrentTurn(turn: number): void;
	setSelectedTile(tile: TileSummary | null): void;
	setHoveredTile(tile: TileSummary | null): void;
	setCameraData(cameraData: CameraEntity): void;
	setSelectedMapMode(mapMode: MapMode): void;
	setMovementState(state: MovementState | null): void;
	clearCommands(): void;
	setTurnState(turnState: GameTurnState): void;
	addCommand(command: Command): void;
	removeCommand(commandId: CommandId): void;
	replaceGameState(state: GameState): void;
}


export class GameStateWriterImpl implements GameStateWriter {

	private readonly commandDatabase: CommandDatabase;
	private readonly tileDatabase: TileDatabase;
	private readonly realmDatabase: RealmDatabase;
	private readonly worldObjectDatabase: WorldObjectDatabase;
	private readonly cameraDatabase: CameraDatabase;
	private readonly gameSessionDatabase: GameSessionDatabase;

	constructor(
		commandDatabase: CommandDatabase,
		tileDatabase: TileDatabase,
		realmDatabase: RealmDatabase,
		worldObjectDatabase: WorldObjectDatabase,
		cameraDatabase: CameraDatabase,
		gameSessionDatabase: GameSessionDatabase,
	) {
		this.commandDatabase = commandDatabase;
		this.tileDatabase = tileDatabase;
		this.realmDatabase = realmDatabase;
		this.worldObjectDatabase = worldObjectDatabase;
		this.cameraDatabase = cameraDatabase;
		this.gameSessionDatabase = gameSessionDatabase;
	}

	addCommand(command: Command): void {
		this.commandDatabase.insert(command);
	}

	clearCommands(): void {
		this.commandDatabase.deleteAll();
	}

	removeCommand(commandId: CommandId): void {
		this.commandDatabase.delete(commandId);
	}

	replaceGameState(state: GameState): void {
		Transaction.run([this.commandDatabase, this.tileDatabase, this.realmDatabase, this.worldObjectDatabase], () => {
			this.commandDatabase.deleteAll();
			this.commandDatabase.insertMany(state.commands);
			this.tileDatabase.deleteAll();
			this.tileDatabase.insertMany(state.tiles);
			this.realmDatabase.deleteAll();
			this.realmDatabase.insertMany(state.realms);
			this.worldObjectDatabase.deleteAll();
			this.worldObjectDatabase.insertMany(state.worldObjects);
		});
	}

	setCameraData(camera: CameraEntity): void {
		this.cameraDatabase.set(camera);
	}

	setCurrentTurn(turn: number): void {
		this.gameSessionDatabase.update(() => ({
			turn: turn,
		}));
	}

	setGameSessionState(state: GameSessionState): void {
		this.gameSessionDatabase.update(() => ({
			sessionState: state,
		}));
	}

	setHoveredTile(tile: TileSummary | null): void {
		this.gameSessionDatabase.update(() => ({
			hoverTile: tile,
		}));
	}

	setMovementState(state: MovementState | null): void {
		if (state) {
			MovementModeState.useState.getState().set(state.worldObjectId, state.path, state.availableTargets);
		} else {
			MovementModeState.useState.getState().set(null, [], []);
		}
	}

	setSelectedMapMode(mapMode: MapMode): void {
		this.gameSessionDatabase.update(() => ({
			mapMode: mapMode,
		}));
	}

	setSelectedTile(tile: TileSummary | null): void {
		this.gameSessionDatabase.update(() => ({
			selectedTile: tile,
		}));
	}

	setTurnState(state: GameTurnState): void {
		this.gameSessionDatabase.update(() => ({
			turnState: state,
		}));
	}

}
