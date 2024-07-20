import {MapMode} from "../models/mapMode";
import {Tile, TileIdentifier} from "../models/tile";
import {TileDatabase} from "../state/database/tileDatabase";
import {CameraDatabase} from "../state/database/cameraDatabase";
import {CameraData} from "../models/cameraData";
import {GameSessionDatabase} from "../state/database/gameSessionDatabase";
import {Transaction} from "../shared/db/database/transaction";

export class GameRepository {

	private readonly gameSessionDb: GameSessionDatabase;
	private readonly cameraDb: CameraDatabase;
	private readonly tileDb: TileDatabase;

	constructor(gameSessionDb: GameSessionDatabase, cameraDb: CameraDatabase, tileDb: TileDatabase) {
		this.gameSessionDb = gameSessionDb;
		this.cameraDb = cameraDb;
		this.tileDb = tileDb;
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

	public transactionForStartTurn(action: () => void) {
		Transaction.run([this.tileDb], action);
	}

	public replaceTiles(tiles: Tile[]) {
		this.tileDb.deleteAll();
		this.tileDb.insertMany(tiles);
	}

}