import {MapMode} from "../models/mapMode";
import {Tile, TileIdentifier} from "../models/tile";
import {TileDatabase} from "./database/tileDatabase";
import {CameraDatabase} from "./database/cameraDatabase";
import {CameraData} from "../models/cameraData";
import {GameSessionDatabase} from "./database/gameSessionDatabase";

export class GameRepository {

	private readonly gameSessionDb: GameSessionDatabase;
	private readonly cameraDb: CameraDatabase;
	private readonly tileDb: TileDatabase;

	constructor(gameSessionDb: GameSessionDatabase, cameraDb: CameraDatabase, tileDb: TileDatabase) {
		this.gameSessionDb = gameSessionDb;
		this.cameraDb = cameraDb;
		this.tileDb = tileDb;
	}

	public getTurn(): number {
		return this.gameSessionDb.get().turn
	}

	public getCamera(): CameraData {
		return this.cameraDb.get()
	}

	public getMapMode(): MapMode {
		return MapMode.DEFAULT
	}

	public getSelectedTile(): TileIdentifier | null {
		return this.gameSessionDb.getSelectedTile()
	}

	public getHoverTile(): TileIdentifier | null {
		return this.gameSessionDb.getHoverTile()
	}

	public getTilesAll(): Tile[] {
		return this.tileDb.queryMany(TileDatabase.QUERY_ALL, null)
	}

	public getTileAt(q: number, r: number): Tile | null {
		return this.tileDb.querySingle(TileDatabase.QUERY_BY_POSITION, [q, r])
	}

}