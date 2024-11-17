import {GameSessionDatabase} from "../database/gameSessionDatabase";
import {TileDatabase} from "../database/tileDatabase";
import {Tile, TileIdentifier} from "../../models/base/tile";

export class TileRepository {

	private readonly gameSessionDb: GameSessionDatabase;
	private readonly tileDb: TileDatabase;

	constructor(
		gameSessionDb: GameSessionDatabase,
		tileDb: TileDatabase,
	) {
		this.gameSessionDb = gameSessionDb;
		this.tileDb = tileDb;
	}

	public getSelected(): TileIdentifier | null {
		return this.gameSessionDb.getSelectedTile();
	}

	public setSelected(tile: TileIdentifier | null) {
		this.gameSessionDb.setSelectedTile(tile);
	}

	public getHover(): TileIdentifier | null {
		return this.gameSessionDb.getHoverTile();
	}

	public setHover(tile: TileIdentifier | null): void {
		return this.gameSessionDb.setHoverTile(tile);
	}

	public getAt(q: number, r: number): Tile | null {
		return this.tileDb.querySingle(TileDatabase.QUERY_BY_POSITION, [q, r]);
	}

	public getAll(): Tile[] {
		return this.tileDb.queryMany(TileDatabase.QUERY_ALL, null);
	}

}