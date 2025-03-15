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
import {Command} from "../models/command/command";
import {CommandType} from "../models/command/commandType";
import {SettlementId} from "../models/settlement/settlementId";
import {MapMode} from "../models/misc/mapMode";
import {Country} from "../models/country/country";
import {Route} from "../models/route/route";
import {GameSessionState} from "../models/misc/gameSessionState";

export interface LocalStateAccess { // todo: check which consumers require "full" models and which can use reduced models
	//user
	getAuthTokenOrNull(): string | null
	// game
	getCurrentTurn(): number
	getGameSessionState(): GameSessionState
	// map
	getMapMode(): MapMode
	// camera
	getCamera(): CameraEntity;
	// tiles
	getTilesRevId(): string, // todo: move caching to this access (not in render context)
	getSelectedTile(): TileSummary | null;
	getHoveredTile(): TileSummary | null;
	getTileAt(q: number, r: number): Tile | null;
	getTiles(): Tile[];
	// country
	getPlayerCountry(): Country
	// world objects
	getWorldObject(id: WorldObjectId): WorldObject | null
	getWorldObjectsAt(q: number, r: number): WorldObject[]
	getWorldObjects(): WorldObject[]
	getWorldObjectsRevId(): string
	getCurrentMovementState(): MovementState | null
	getMovePaths(): ({tiles: TileSummary[], pending: boolean})[]
	getMoveTargets(): TileSummary[]
	// settlements
	getSettlementsRevId(): string
	getSettlements(): Settlement[]
	getSettlementAt(q: number, r: number): Settlement | null
	getSettlementProductionQueue(id: SettlementId): SettlementProductionQueueEntry[] | null
	// routes
	getRoutesRevId(): string
	getRoutes(): Route[]
	// commands
	getCommandRevId(): string
	getCommands(): Command[]
	getCommandsOfType<T extends Command>(type: CommandType): T[]
}

export class LocalStateAccessImpl implements LocalStateAccess {

	private readonly cameraDatabase: CameraDatabase;
	private readonly tileDatabase: TileDatabase;
	private readonly gameSessionDatabase: GameSessionDatabase;

	constructor(cameraDatabase: CameraDatabase, tileDatabase: TileDatabase, gameSessionDatabase: GameSessionDatabase) {
		this.cameraDatabase = cameraDatabase;
		this.tileDatabase = tileDatabase;
		this.gameSessionDatabase = gameSessionDatabase;
	}

	//========== USER =========================================================

	getAuthTokenOrNull(): string | null {
		return null // todo
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

	getTilesRevId(): string {
		return this.tileDatabase.getRevId()
	}

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

	getTiles(): Tile[] {
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
		return (null as unknown) as Country // todo
	}

	//========== WORLD OBJECTS =================================================

	getWorldObject(id: WorldObjectId): WorldObject | null {
		return (null as unknown) as WorldObject // todo
	}

	getWorldObjectsAt(q: number, r: number): WorldObject[] {
		return (null as unknown) as WorldObject[] // todo
	}

	getWorldObjects(): WorldObject[] {
		return [] // todo
	}

	getWorldObjectsRevId(): string {
		return (null as unknown) as string // todo
	}

	getCurrentMovementState(): MovementState | null {
		return (null as unknown) as MovementState // todo
	}

	getMovePaths(): ({tiles: TileSummary[], pending: boolean})[] {
		return (null as unknown) as any // todo
	}

	getMoveTargets(): TileSummary[] {
		return [] // todo
	}

	//========== SETTLEMENTS ===================================================

	getSettlementsRevId(): string {
		return (null as unknown) as any // todo
	}

	getSettlements(): Settlement[] {
		return (null as unknown) as any // todo
	}

	getSettlementAt(q: number, r: number): Settlement | null {
		return (null as unknown) as any // todo
	}

	getSettlementProductionQueue(id: SettlementId): SettlementProductionQueueEntry[] | null {
		return (null as unknown) as any // todo
	}

	//========== ROUTES ========================================================

	getRoutesRevId(): string {
		return (null as unknown) as any // todo
	}

	getRoutes(): Route[] {
		return (null as unknown) as any // todo
	}

	//========== COMMANDS ======================================================

	getCommandRevId(): string {
		return (null as unknown) as any // todo
	}

	getCommands(): Command[] {
		return (null as unknown) as any // todo
	}

	getCommandsOfType<T extends Command>(type: CommandType): T[] {
		return (null as unknown) as any // todo
	}
}