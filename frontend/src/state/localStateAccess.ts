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

export interface LocalStateAccess { // todo: check which consumers require "full" models and which can use reduced models
	// game
	getCurrentTurn(): number
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

	//========== CAMERA =======================================================

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

	// todo: check

	//========== GAME ==========================================================

	getCurrentTurn(): number {
		return this.gameSessionDatabase.get().currentTurn;
	}

	//========== MAP ===========================================================

	getMapMode(): MapMode {
		return this.gameSessionDatabase.get().mapMode;
	}

	//========== TILES =========================================================

	getTilesRevId(): string {
		return this.tileDatabase.getRevisionId();
	}

	//========== COUNTRY =======================================================

	getPlayerCountry(): Country {
		return this.gameSessionDatabase.get().playerCountry;
	}

	//========== WORLD OBJECTS =================================================

	getWorldObject(id: WorldObjectId): WorldObject | null {
		return this.gameSessionDatabase.getWorldObject(id);
	}

	getWorldObjectsAt(q: number, r: number): WorldObject[] {
		return this.gameSessionDatabase.getWorldObjectsAt(q, r);
	}

	getWorldObjects(): WorldObject[] {
		return this.gameSessionDatabase.getWorldObjects();
	}

	getWorldObjectsRevId(): string {
		return this.gameSessionDatabase.getWorldObjectsRevId();
	}

	getCurrentMovementState(): MovementState | null {
		return this.gameSessionDatabase.getCurrentMovementState();
	}

	getMovePaths(): ({tiles: TileSummary[], pending: boolean})[] {
		return this.gameSessionDatabase.getMovePaths();
	}

	getMoveTargets(): TileSummary[] {
		return this.gameSessionDatabase.getMoveTargets();
	}

	//========== SETTLEMENTS ===================================================

	getSettlementsRevId(): string {
		return this.gameSessionDatabase.getSettlementsRevId();
	}

	getSettlements(): Settlement[] {
		return this.gameSessionDatabase.getSettlements();
	}

	getSettlementAt(q: number, r: number): Settlement | null {
		return this.gameSessionDatabase.getSettlementAt(q, r);
	}

	getSettlementProductionQueue(id: SettlementId): SettlementProductionQueueEntry[] | null {
		return this.gameSessionDatabase.getSettlementProductionQueue(id);
	}

	//========== ROUTES ========================================================

	getRoutesRevId(): string {
		return this.gameSessionDatabase.getRoutesRevId();
	}

	getRoutes(): Route[] {
		return this.gameSessionDatabase.getRoutes();
	}

	//========== COMMANDS ======================================================

	getCommandRevId(): string {
		return this.gameSessionDatabase.getCommandRevId();
	}

	getCommands(): Command[] {
		return this.gameSessionDatabase.getCommands();
	}

	getCommandsOfType<T extends Command>(type: CommandType): T[] {
		return this.gameSessionDatabase.getCommandsOfType(type);
	}
}