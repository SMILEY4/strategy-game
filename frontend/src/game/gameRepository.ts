import {Tile, TileIdentifier} from "../models/tile";
import {TileDatabase} from "../state/database/tileDatabase";
import {CameraDatabase} from "../state/database/cameraDatabase";
import {CameraData} from "../models/cameraData";
import {GameSessionDatabase} from "../state/database/gameSessionDatabase";
import {Transaction} from "../shared/db/database/transaction";
import {WorldObjectDatabase} from "../state/database/objectDatabase";
import {WorldObject} from "../models/worldObject";
import {WorldObjectType} from "../models/worldObjectType";

export class GameRepository {

	private readonly gameSessionDb: GameSessionDatabase;
	private readonly cameraDb: CameraDatabase;
	private readonly tileDb: TileDatabase;
	private readonly worldObjectDb: WorldObjectDatabase;

	constructor(gameSessionDb: GameSessionDatabase, cameraDb: CameraDatabase, tileDb: TileDatabase, worldObjectDb: WorldObjectDatabase) {
		this.gameSessionDb = gameSessionDb;
		this.cameraDb = cameraDb;
		this.tileDb = tileDb;
		this.worldObjectDb = worldObjectDb;
	}

	public getCamera(): CameraData {
		return this.cameraDb.get()
	}

	public setCamera(camera: CameraData): void {
		return this.cameraDb.set(camera)
	}

	public getSelectedTile(): TileIdentifier | null {
		return this.gameSessionDb.getSelectedTile()
	}

	public setSelectedTile(tile: TileIdentifier | null) {
		this.gameSessionDb.setSelectedTile(tile)
	}

	public getHoverTile(): TileIdentifier | null {
		return this.gameSessionDb.getHoverTile()
	}

	public setHoverTile(tile: TileIdentifier | null): void {
		return this.gameSessionDb.setHoverTile(tile)
	}

	public getTileAt(q: number, r: number): Tile | null {
		return this.tileDb.querySingle(TileDatabase.QUERY_BY_POSITION, [q, r])
	}

	public getWorldObjectByTile(tileId: TileIdentifier): WorldObject | null {
		return this.worldObjectDb.querySingle(WorldObjectDatabase.QUERY_BY_POSITION, [tileId.q, tileId.r])
	}

	public transactionForStartTurn(action: () => void) {
		Transaction.run([this.tileDb], action);
	}

	public replaceTiles(tiles: Tile[]) {
		this.tileDb.deleteAll();
		this.tileDb.insertMany(tiles);
	}

	public replaceWorldObjects(worldObject: WorldObject[]) {
		this.worldObjectDb.deleteAll()
		this.worldObjectDb.insertMany(worldObject)
	}
}