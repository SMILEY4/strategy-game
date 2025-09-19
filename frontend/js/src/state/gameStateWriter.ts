import {CameraData} from "../models/misc/cameraData";
import {TileSummary} from "../models/tile/tileSummary";
import {MapMode} from "../models/misc/mapMode";
import {MovementState} from "../models/misc/movementState";
import {Command} from "../models/command/command";
import {GameStateContainer} from "../models/misc/gameStateContainer";
import {CameraDatabase} from "./database/cameraDatabase";
import {GameSessionDatabase} from "./database/gameSessionDatabase";
import {CommandDatabase} from "./database/commandDatabase";
import {MovementModeState} from "./database/movementModeState";
import {Transaction} from "../common/db/database/transaction";
import {TileDatabase} from "./database/tileDatabase";
import {WorldObjectDatabase} from "./database/worldObjectDatabase";
import {RealmDatabase} from "./database/realmDatabase";
import {GameSession} from "../models/misc/gameSession";
import {Tile} from "../models/tile/tile";

export interface GameStateWriter {
	setGameSessionState(state: GameSession.SessionState): void;
	setTurnState(state: GameSession.TurnState): void;
	setCurrentTurn(turn: number): void;
	setSelectedTile(tile: TileSummary | null): void;
	setHoveredTile(tile: TileSummary | null): void;
	setHighlightedTiles(tilePositions: Tile.Position[]): void;
	setCameraData(cameraData: CameraData): void;
	setSelectedMapMode(mapMode: MapMode): void;
	setMovementState(state: MovementState | null): void;
	clearCommands(): void;
	addCommand(command: Command): void;
	removeCommand(commandId: Command.Id): void;
	replaceGameState(state: GameStateContainer): void;
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

	replaceGameState(state: GameStateContainer): void {
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

	setGameSessionState(state: GameSession.SessionState): void {
		this.gameSessionDatabase.update(() => ({
			sessionState: state,
		}));
	}


	setTurnState(state: GameSession.TurnState): void {
		this.gameSessionDatabase.update(() => ({
			turnState: state,
		}));
	}

	setCurrentTurn(turn: number): void {
		this.gameSessionDatabase.update(() => ({
			turn: turn,
		}));
	}

	setCameraData(camera: CameraData): void {
		this.cameraDatabase.set(camera);
	}

	setHoveredTile(tile: TileSummary | null): void {
		this.gameSessionDatabase.update(() => ({
			hoverTile: tile,
		}));
	}

	setSelectedTile(tile: TileSummary | null): void {
		this.gameSessionDatabase.update(() => ({
			selectedTile: tile,
		}));
	}

	setHighlightedTiles(tilePositions: Tile.Position[]): void {
		this.gameSessionDatabase.update(() => ({
			highlightedTiles: tilePositions,
		}));
	}

	setMovementState(state: MovementState | null): void {
		if (state) {
			MovementModeState.useState.getState().set(state.worldObjectId, state.path);
		} else {
			MovementModeState.useState.getState().set(null, []);
		}
	}

	setSelectedMapMode(mapMode: MapMode): void {
		this.gameSessionDatabase.update(() => ({
			mapMode: mapMode,
		}));
	}

	addCommand(command: Command): void {
		this.commandDatabase.insert(command);
	}

	clearCommands(): void {
		this.commandDatabase.deleteAll();
	}

	removeCommand(commandId: Command.Id): void {
		this.commandDatabase.delete(commandId);
	}

}
