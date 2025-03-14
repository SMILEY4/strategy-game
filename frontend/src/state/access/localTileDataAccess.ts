import {GameSessionDatabase} from "../database/gameSessionDatabase";
import {TileDatabase} from "../database/tileDatabase";
import {TileSummary} from "../../models/tile/tileSummary";
import {Tile} from "../../models/tile/tile";

export interface LocalTileDataAccess {
	getSelected(): TileSummary | null;
	getHovered(): TileSummary | null;
	getAt(q: number, r: number): Tile | null;
	getAll(): Tile[];
}

export class LocalTileDataAccessImpl implements LocalTileDataAccess {

	private readonly tileDatabase: TileDatabase;
	private readonly gameSessionDatabase: GameSessionDatabase;

	constructor(tileDatabase: TileDatabase, gameSessionDatabase: GameSessionDatabase) {
		this.tileDatabase = tileDatabase;
		this.gameSessionDatabase = gameSessionDatabase;
	}

	getHovered(): TileSummary | null {
		return this.gameSessionDatabase.get().hoverTile;
	}

	getSelected(): TileSummary | null {
		return this.gameSessionDatabase.get().selectedTile;
	}

	getAt(q: number, r: number): Tile | null {
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

	getAll(): Tile[] {
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


}