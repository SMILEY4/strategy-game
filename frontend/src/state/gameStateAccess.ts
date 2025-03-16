import {TileSummary} from "../models/tile/tileSummary";
import {Tile} from "../models/tile/tile";
import {CameraEntity} from "../models/misc/cameraEntity";
import {CameraDatabase} from "./database/cameraDatabase";
import {TileDatabase} from "./database/tileDatabase";
import {GameSessionDatabase} from "./database/gameSessionDatabase";
import {WorldObject} from "../models/worldobject/worldObject";
import {WorldObjectId} from "../models/worldobject/worldObjectId";
import {MovementState} from "../models/misc/movementState";
import {Settlement, SettlementProductionQueueEntry} from "../models/settlement/settlement";
import {Command, MoveCommand} from "../models/command/command";
import {CommandType} from "../models/command/commandType";
import {SettlementId} from "../models/settlement/settlementId";
import {MapMode} from "../models/misc/mapMode";
import {Country} from "../models/country/country";
import {Route} from "../models/route/route";
import {GameSessionState} from "../models/misc/gameSessionState";
import {CountryDatabase} from "./database/countryDatabase";
import {WorldObjectDatabase} from "./database/worldObjectDatabase";
import {MovementModeState} from "./database/movementModeState";
import {SettlementDatabase} from "./database/settlementDatabase";
import {RouteDatabase} from "./database/routeDatabase";
import {CommandDatabase} from "./database/commandDatabase";
import {SettlementBuilder} from "./utils/settlementBuilder";
import {WorldObjectSummary} from "../models/worldobject/worldObjectSummary";
import {SettlementSummary} from "../models/settlement/settlementSummary";
import {DbCache} from "../common/db/dbCache";

export interface GameStateAccess {
	// game
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
	// country
	getPlayerCountry(): Country;
	// world objects
	getWorldObjectSummary(id: WorldObjectId): WorldObjectSummary | null;
	getWorldObjectSummariesAt(q: number, r: number): WorldObjectSummary[];
	getWorldObjects(): WorldObject[];
	getCurrentMovementState(): MovementState | null;
	getMovePaths(): ({ tiles: TileSummary[], pending: boolean })[];
	getMoveTargets(): TileSummary[];
	// settlements
	// todo: maybe own reduced settlement model for rendering
	getSettlements(): Settlement[];
	getSettlementAt(q: number, r: number): Settlement | null;
	getSettlementSummaryAt(q: number, r: number): SettlementSummary | null;
	getSettlementProductionQueue(id: SettlementId): SettlementProductionQueueEntry[] | null;
	// routes
	getRoutes(): Route[];
	// commands
	getCommandRevId(): string;
	getCommands(): Command[];
	getCommandsOfType<T extends Command>(type: CommandType): T[];
}

export class GameStateAccessImpl implements GameStateAccess {

	private readonly cameraDatabase: CameraDatabase;
	private readonly tileDatabase: TileDatabase;
	private readonly gameSessionDatabase: GameSessionDatabase;
	private readonly countryDatabase: CountryDatabase;
	private readonly worldObjectDatabase: WorldObjectDatabase;
	private readonly settlementDatabase: SettlementDatabase;
	private readonly routeDatabase: RouteDatabase;
	private readonly commandDatabase: CommandDatabase;

	private readonly tilesCache: DbCache<Tile[]>;
	private readonly settlementsCache: DbCache<Settlement[]>;
	private readonly worldObjectsCache: DbCache<WorldObject[]>;
	private readonly routesCache: DbCache<Route[]>;

	constructor(
		cameraDatabase: CameraDatabase,
		tileDatabase: TileDatabase,
		gameSessionDatabase: GameSessionDatabase,
		countryDatabase: CountryDatabase,
		worldObjectDatabase: WorldObjectDatabase,
		settlementDatabase: SettlementDatabase,
		routeDatabase: RouteDatabase,
		commandDatabase: CommandDatabase,
	) {
		this.cameraDatabase = cameraDatabase;
		this.tileDatabase = tileDatabase;
		this.gameSessionDatabase = gameSessionDatabase;
		this.countryDatabase = countryDatabase;
		this.worldObjectDatabase = worldObjectDatabase;
		this.settlementDatabase = settlementDatabase;
		this.routeDatabase = routeDatabase;
		this.commandDatabase = commandDatabase;
		this.tilesCache = new DbCache({
			dataProvider: () => this.getTilesUncached(),
			dependencies: [this.tileDatabase],
		});
		this.settlementsCache = new DbCache({
			dataProvider: () => this.getSettlementsUncached(),
			dependencies: [this.settlementDatabase, this.routeDatabase, this.commandDatabase],
		});
		this.worldObjectsCache = new DbCache({
			dataProvider: () => this.getWorldObjectsUncached(),
			dependencies: [this.worldObjectDatabase],
		});
		this.routesCache = new DbCache({
			dataProvider: () => this.getRoutesUncached(),
			dependencies: [this.routeDatabase],
		});
	}

	//========== GAME ==========================================================

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

	getSelectedTile(): TileSummary | null {
		return this.gameSessionDatabase.get().selectedTile;
	}

	getHoveredTile(): TileSummary | null {
		return this.gameSessionDatabase.get().hoverTile;
	}

	getTileAt(q: number, r: number): Tile | null {
		const entity = this.tileDatabase.querySingle(TileDatabase.QUERY_BY_POSITION, [q, r]);
		if (!entity) {
			return null;
		}
		return {
			id: entity.id,
			position: entity.position,
			visibility: entity.visibility,
			base: entity.base,
			political: entity.political,
			isValidSettlementLocation: entity.isValidSettlementLocation,
			objects: entity.objects,
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

	getTiles(): Tile[] {
		return this.tilesCache.get();
	}

	private getTilesUncached(): Tile[] {
		return this.tileDatabase.queryMany(TileDatabase.QUERY_ALL, null)
			.map(entity => ({
				id: entity.id,
				position: entity.position,
				visibility: entity.visibility,
				base: entity.base,
				political: entity.political,
				isValidSettlementLocation: entity.isValidSettlementLocation,
				objects: entity.objects,
			}));
	}

	//========== COUNTRY =======================================================

	getPlayerCountry(): Country {
		return this.countryDatabase.querySingleOrThrow(CountryDatabase.QUERY_IS_USER_COUNTRY, null);
	}

	//========== WORLD OBJECTS =================================================

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
		this.getCommandsOfType<MoveCommand>(CommandType.MOVE).forEach(cmd => {
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

	//========== SETTLEMENTS ===================================================

	getSettlements(): Settlement[] {
		return this.settlementsCache.get();
	}

	private getSettlementsUncached(): Settlement[] {
		const settlements = this.settlementDatabase.queryMany(SettlementDatabase.QUERY_ALL, null);
		const routes = this.routeDatabase.queryMany(RouteDatabase.QUERY_ALL, null);
		const commands = this.commandDatabase.queryMany(CommandDatabase.QUERY_ALL, null);
		return settlements.map(it => SettlementBuilder.buildSettlement(it, routes, settlements, commands));
	}

	getSettlementAt(q: number, r: number): Settlement | null {
		const settlement = this.settlementDatabase.querySingle(SettlementDatabase.QUERY_BY_POSITION, [q, r]);
		if (settlement) {
			const settlements = this.settlementDatabase.queryMany(SettlementDatabase.QUERY_ALL, null);
			const routes = this.routeDatabase.queryMany(RouteDatabase.QUERY_ALL, null);
			const commands = this.commandDatabase.queryMany(CommandDatabase.QUERY_ALL, null);
			return SettlementBuilder.buildSettlement(settlement, routes, settlements, commands);
		} else {
			return null;
		}
	}

	getSettlementSummaryAt(q: number, r: number): SettlementSummary | null {
		const settlement = this.settlementDatabase.querySingle(SettlementDatabase.QUERY_BY_POSITION, [q, r]);
		if (settlement) {
			return {
				id: settlement.id,
				name: settlement.name,
				color: settlement.color,
				isUserControlled: settlement.country.isUserControlled,
			};
		} else {
			return null;
		}
	}

	getSettlementProductionQueue(id: SettlementId): SettlementProductionQueueEntry[] | null {
		const settlement = this.settlementDatabase.querySingle(SettlementDatabase.QUERY_BY_ID, id);
		if (settlement) {
			const commands = this.commandDatabase.queryMany(CommandDatabase.QUERY_ALL, null);
			return SettlementBuilder.buildProductionQueue(settlement, commands);
		} else {
			return null;
		}
	}

	//========== ROUTES ========================================================

	getRoutes(): Route[] {
		return this.routesCache.get()
	}

	getRoutesUncached(): Route[] {
		return this.routeDatabase.queryMany(RouteDatabase.QUERY_ALL, null);
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