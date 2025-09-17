import {TileSummary} from "../models/tile/tileSummary";
import {Tile} from "../models/tile/tile";
import {CameraEntity} from "../models/misc/cameraEntity";
import {CameraDatabase} from "./database/cameraDatabase";
import {TileDatabase} from "./database/tileDatabase";
import {GameSessionDatabase} from "./database/gameSessionDatabase";
import {WorldObject} from "../models/worldobject/worldObject";
import {WorldObjectId} from "../models/worldobject/worldObjectId";
import {MovementState} from "../models/misc/movementState";
import {Command, MoveCommand} from "../models/command/command";
import {CommandType} from "../models/command/commandType";
import {MapMode} from "../models/misc/mapMode";
import {GameSessionState} from "../models/misc/gameSessionState";
import {RealmDatabase} from "./database/realmDatabase";
import {WorldObjectDatabase} from "./database/worldObjectDatabase";
import {MovementModeState} from "./database/movementModeState";
import {CommandDatabase} from "./database/commandDatabase";
import {WorldObjectSummary} from "../models/worldobject/worldObjectSummary";
import {DbCache} from "../common/db/dbCache";
import {RealmSummary} from "../models/realm/realmSummary";
import {TilePosition} from "../models/tile/tilePosition";

export interface GameStateAccess {
	// game
	getGameIdOrThrow(): string
	getCurrentTurn(): number;
	getGameSessionState(): GameSessionState;
	// map
	getMapMode(): MapMode;
	// camera
	getCamera(): CameraEntity;
	// tiles
	getSelectedTile(): TileSummary | null;
	getHoveredTile(): TileSummary | null;
	getTileAt(q: number, r: number): Tile | null;
	getTileSummaryAt(q: number, r: number): TileSummary | null;
	getTiles(): Tile[];
	getTilesRevId(): string;
	getSpawnTile(): TileSummary;
	// realms
	getPlayerRealmSummary(): RealmSummary;
	// world objects
	getWorldObjectSummary(id: WorldObjectId): WorldObjectSummary | null;
	getWorldObjectSummariesAt(q: number, r: number): WorldObjectSummary[];
	getWorldObjects(): WorldObject[];
	getCurrentMovementState(): MovementState | null;
	getMovePaths(): ({ tiles: TileSummary[], pending: boolean })[];
	getMoveTargets(): TileSummary[];
	getWorldObjectsRevId(): string;
	// commands
	getCommands(): Command[];
	getCommandsOfType<T extends Command>(type: CommandType): T[];
	getCommandRevId(): string;
}

export class GameStateAccessImpl implements GameStateAccess {

	private readonly cameraDatabase: CameraDatabase;
	private readonly tileDatabase: TileDatabase;
	private readonly gameSessionDatabase: GameSessionDatabase;
	private readonly realmDatabase: RealmDatabase;
	private readonly worldObjectDatabase: WorldObjectDatabase;
	private readonly commandDatabase: CommandDatabase;

	private readonly tilesCache: DbCache<Tile[]>;
	private readonly worldObjectsCache: DbCache<WorldObject[]>;

	constructor(
		cameraDatabase: CameraDatabase,
		tileDatabase: TileDatabase,
		gameSessionDatabase: GameSessionDatabase,
		realmDatabase: RealmDatabase,
		worldObjectDatabase: WorldObjectDatabase,
		commandDatabase: CommandDatabase,
	) {
		this.cameraDatabase = cameraDatabase;
		this.tileDatabase = tileDatabase;
		this.gameSessionDatabase = gameSessionDatabase;
		this.realmDatabase = realmDatabase;
		this.worldObjectDatabase = worldObjectDatabase;
		this.commandDatabase = commandDatabase;
		this.tilesCache = new DbCache({
			dataProvider: () => this.getTilesUncached(),
			dependencies: [this.tileDatabase],
		});
		this.worldObjectsCache = new DbCache({
			dataProvider: () => this.getWorldObjectsUncached(),
			dependencies: [this.worldObjectDatabase],
		});
	}

	//========== GAME ==========================================================

	getGameIdOrThrow(): string {
		const urlParams = new URLSearchParams(window.location.search);
		const gameId = urlParams.get('id');
		if(gameId) {
			return gameId
		} else {
			throw new Error("Could not get game-id from url")
		}
	}

	getCurrentTurn(): number {
		return this.gameSessionDatabase.get().turn;
	}

	getGameSessionState(): GameSessionState {
		return this.gameSessionDatabase.get().sessionState;
	}


	//========== MAP ===========================================================

	getMapMode(): MapMode {
		return this.gameSessionDatabase.get().mapMode;
	}

	//========== CAMERA ========================================================

	getCamera(): CameraEntity {
		return this.cameraDatabase.get();
	}


	//========== TILES ========================================================

	getTilesRevId(): string {
		return this.tileDatabase.getRevId();
	}

	getSelectedTile(): TileSummary | null {
		return this.gameSessionDatabase.get().selectedTile;
	}

	getHoveredTile(): TileSummary | null {
		return this.gameSessionDatabase.get().hoverTile;
	}

	getTileAt(q: number, r: number): Tile | null {
		const tile = this.tileDatabase.querySingle(TileDatabase.QUERY_BY_POSITION, [q, r]);
		if (!tile) {
			return null;
		}
		const worldObjects = this.worldObjectDatabase.queryMany(WorldObjectDatabase.QUERY_BY_POSITION, [q, r]);
		return {
			id: tile.id,
			position: tile.position,
			visibility: tile.visibility,
			base: tile.base,
			worldObjects: worldObjects.map(it => WorldObjectSummary.from(it)),
			metaProperties: tile.metaProperties
		};
	}

	getTileSummaryAt(q: number, r: number): TileSummary | null {
		const entity = this.tileDatabase.querySingle(TileDatabase.QUERY_BY_POSITION, [q, r]);
		if (!entity) {
			return null;
		}
		return {
			id: entity.id,
			position: entity.position,
		};
	}

	getSpawnTile(): TileSummary {

		const playerRealm = this.realmDatabase.querySingleOrThrow(RealmDatabase.QUERY_IS_USER_REALM, null);

		const scout = this.worldObjectDatabase
			.queryMany(WorldObjectDatabase.QUERY_BY_REALM_ID, playerRealm.id)
			.find(it => it.type.group == "unit" && it.type.name == "scout")
		if(scout) {
			return scout.tile
		}

		const tileCenter =  this.getTileSummaryAt(0, 0);
		if(tileCenter) {
			return tileCenter;
		}

		throw new Error("Could not find spawn tile.")
	}

	getTiles(): Tile[] {
		return this.tilesCache.get();
	}

	private getTilesUncached(): Tile[] {
		return this.tileDatabase.queryMany(TileDatabase.QUERY_ALL, null)
			.map(tile => ({
				id: tile.id,
				position: tile.position,
				visibility: tile.visibility,
				base: tile.base,
				worldObjects: this.worldObjectDatabase
					.queryMany(WorldObjectDatabase.QUERY_BY_POSITION, [tile.position.q, tile.position.r])
					.map(it => WorldObjectSummary.from(it)),
				metaProperties: tile.metaProperties
			}));
	}

	//========== REALM =========================================================

	getPlayerRealmSummary(): RealmSummary {
		const entity = this.realmDatabase.querySingleOrThrow(RealmDatabase.QUERY_IS_USER_REALM, null);
		return {
			id: entity.id,
			name: entity.name,
			color: entity.color,
			ownedByUser: entity.ownedByUser,
			playerName: entity.player.name,
		}
	}

	//========== WORLD OBJECTS =================================================

	getWorldObjectsRevId(): string {
		return this.worldObjectDatabase.getRevId();
	}

	getWorldObjectSummary(id: WorldObjectId): WorldObjectSummary | null {
		return this.worldObjectDatabase.querySingle(WorldObjectDatabase.QUERY_BY_ID, id);
	}

	getWorldObjectSummariesAt(q: number, r: number): WorldObject[] {
		return this.worldObjectDatabase.queryMany(WorldObjectDatabase.QUERY_BY_POSITION, [q, r]);
	}

	getWorldObjects(): WorldObject[] {
		return this.worldObjectsCache.get()
	}

	getWorldObjectsUncached(): WorldObject[] {
		return this.worldObjectDatabase.queryMany(WorldObjectDatabase.QUERY_ALL, null);
	}

	getCurrentMovementState(): MovementState | null {
		if (MovementModeState.useState.getState().worldObjectId) {
			const state = MovementModeState.useState.getState();
			return {
				worldObjectId: state.worldObjectId!,
				path: state.path,
				availableTargets: state.availableTargets,
			};
		} else {
			return null;
		}
	}

	getMovePaths(): ({ tiles: TileSummary[], pending: boolean })[] {
		const results: ({ tiles: TileSummary[], pending: boolean })[] = [];
		if (MovementModeState.useState.getState().worldObjectId) {
			results.push({
				tiles: MovementModeState.useState.getState().path.map(it => it.tile),
				pending: true,
			});
		}
		this.getCommandsOfType<MoveCommand>(CommandType.WORLD_OBJECT_MOVE).forEach(cmd => {
			results.push({
				tiles: cmd.path,
				pending: false,
			});
		});
		return results;
	}

	getMoveTargets(): TileSummary[] {
		if (MovementModeState.useState.getState().worldObjectId) {
			return MovementModeState.useState.getState().availableTargets.map(tgt => tgt.tile);
		} else {
			return [];
		}
	}

	//========== COMMANDS ======================================================

	getCommandRevId(): string {
		return this.commandDatabase.getRevId();
	}

	getCommands(): Command[] {
		return this.commandDatabase.queryMany(CommandDatabase.QUERY_ALL, null);
	}

	getCommandsOfType<T extends Command>(type: CommandType): T[] {
		return this.commandDatabase
			.queryMany(CommandDatabase.QUERY_ALL, null)
			.filter(cmd => cmd.type === type) as T[];
	}

}