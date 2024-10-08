import {Tile, TileIdentifier} from "../models/primitives/tile";
import {TileDatabase} from "../state/database/tileDatabase";
import {CameraDatabase} from "../state/database/cameraDatabase";
import {CameraData} from "../models/primitives/cameraData";
import {GameSessionDatabase} from "../state/database/gameSessionDatabase";
import {Transaction} from "../shared/db/database/transaction";
import {WorldObjectDatabase} from "../state/database/objectDatabase";
import {WorldObject} from "../models/primitives/worldObject";
import {MovementModeState} from "../state/database/movementModeState";
import {Command} from "../models/primitives/command";
import {CommandDatabase} from "../state/database/commandDatabase";
import {MovementTarget} from "../models/primitives/movementTarget";
import {Country} from "../models/primitives/country";
import {CountryDatabase} from "../state/database/countryDatabase";
import {Settlement} from "../models/primitives/Settlement";
import {SettlementDatabase} from "../state/database/settlementDatabase";
import {ProvinceDatabase} from "../state/database/provinceDatabase";
import {Province} from "../models/primitives/province";

export class GameRepository {

	private readonly gameSessionDb: GameSessionDatabase;
	private readonly cameraDb: CameraDatabase;
	private readonly tileDb: TileDatabase;
	private readonly worldObjectDb: WorldObjectDatabase;
	private readonly commandDb: CommandDatabase;
	private readonly countryDb: CountryDatabase;
	private readonly provinceDb: ProvinceDatabase;
	private readonly settlementDb: SettlementDatabase;

	constructor(
		gameSessionDb: GameSessionDatabase,
		cameraDb: CameraDatabase,
		tileDb: TileDatabase,
		worldObjectDb: WorldObjectDatabase,
		commandDb: CommandDatabase,
		countryDb: CountryDatabase,
		provinceDb: ProvinceDatabase,
		settlementDb: SettlementDatabase
	) {
		this.gameSessionDb = gameSessionDb;
		this.cameraDb = cameraDb;
		this.tileDb = tileDb;
		this.worldObjectDb = worldObjectDb;
		this.commandDb = commandDb;
		this.countryDb = countryDb;
		this.provinceDb = provinceDb;
		this.settlementDb = settlementDb;
	}

	public getCamera(): CameraData {
		return this.cameraDb.get();
	}

	public setCamera(camera: CameraData): void {
		return this.cameraDb.set(camera);
	}

	public getCommands(): Command[] {
		return this.commandDb.queryMany(CommandDatabase.QUERY_ALL, null)
	}

	public addCommand(command: Command) {
		this.commandDb.insert(command)
	}

	public deleteCommand(commandId: string) {
		this.commandDb.delete(commandId)
	}

	public clearCommands() {
		this.commandDb.deleteAll()
	}

	public getSelectedTile(): TileIdentifier | null {
		return this.gameSessionDb.getSelectedTile();
	}

	public setSelectedTile(tile: TileIdentifier | null) {
		this.gameSessionDb.setSelectedTile(tile);
	}

	public getHoverTile(): TileIdentifier | null {
		return this.gameSessionDb.getHoverTile();
	}

	public setHoverTile(tile: TileIdentifier | null): void {
		return this.gameSessionDb.setHoverTile(tile);
	}

	public getTileAt(q: number, r: number): Tile | null {
		return this.tileDb.querySingle(TileDatabase.QUERY_BY_POSITION, [q, r]);
	}

	public getSettlementByTile(tileId: TileIdentifier): Settlement | null {
		return this.settlementDb.querySingle(SettlementDatabase.QUERY_BY_POSITION, [tileId.q, tileId.r]);
	}

	public getWorldObjectByTile(tileId: TileIdentifier): WorldObject | null {
		return this.worldObjectDb.querySingle(WorldObjectDatabase.QUERY_BY_POSITION, [tileId.q, tileId.r]);
	}

	public getWorldObject(worldObjectId: string): WorldObject | null {
		return this.worldObjectDb.querySingle(WorldObjectDatabase.QUERY_BY_ID, worldObjectId);
	}

	public transactionForStartTurn(action: () => void) {
		Transaction.run([this.tileDb, this.commandDb, this.countryDb, this.settlementDb, this.provinceDb], action);
	}

	public replaceTiles(tiles: Tile[]) {
		this.tileDb.deleteAll();
		this.tileDb.insertMany(tiles);
	}

	public replaceCountries(countries: Country[]) {
		this.countryDb.deleteAll();
		this.countryDb.insertMany(countries);
	}

	public replaceProvinces(provinces: Province[]) {
		this.provinceDb.deleteAll();
		this.provinceDb.insertMany(provinces)
	}

	public replaceSettlements(settlements: Settlement[]) {
		this.settlementDb.deleteAll();
		this.settlementDb.insertMany(settlements)
	}

	public replaceWorldObjects(worldObject: WorldObject[]) {
		this.worldObjectDb.deleteAll();
		this.worldObjectDb.insertMany(worldObject);
	}

	public getCurrentMovementModeState(): {
		worldObjectId: string | null,
		path: MovementTarget[],
		availableTargets: MovementTarget[]
	} {
		const state = MovementModeState.useState.getState();
		return {
			worldObjectId: state.worldObjectId,
			path: state.path,
			availableTargets: state.availableTargets,
		};
	}

	public setCurrentMovementModeState(worldObjectId: string | null, path: MovementTarget[], availableTargets: MovementTarget[]) {
		MovementModeState.useState.getState().set(worldObjectId, path, availableTargets);
	}

}