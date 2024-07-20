import {Tile, TileIdentifier} from "../../models/tile";
import {TileDatabase} from "../../state/database/tileDatabase";
import {GameSessionDatabase} from "../../state/database/gameSessionDatabase";
import {CameraDatabase} from "../../state/database/cameraDatabase";
import {MapMode} from "../../models/mapMode";
import {CameraData} from "../../models/cameraData";

export class RenderRepository {

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

	public getTurn(): number {
		return this.gameSessionDb.get().turn
	}

	public getTilesAll(): Tile[] {
		return this.tileDb.queryMany(TileDatabase.QUERY_ALL, null)
	}

	public getTileAt(q: number, r: number): Tile | null {
		return this.tileDb.querySingle(TileDatabase.QUERY_BY_POSITION, [q, r])
	}

	public getSelectedTile(): TileIdentifier | null {
		return this.gameSessionDb.getSelectedTile()
	}

	public getHoverTile(): TileIdentifier | null {
		return this.gameSessionDb.getHoverTile()
	}

	public getMapMode(): MapMode {
		return MapMode.DEFAULT
	}
}