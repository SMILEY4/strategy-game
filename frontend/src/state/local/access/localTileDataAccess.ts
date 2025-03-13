import {LocalTile, LocalTileIdentifier} from "../localTile";
import {GameSessionDatabase} from "../../database/gameSessionDatabase";
import {TileDatabase} from "../../database/tileDatabase";

export interface LocalTileDataAccess {
	getIdSelected(): LocalTileIdentifier | null;
	getIdHovered(): LocalTileIdentifier | null;
	getAt(q: number, r: number): LocalTile | null;
	getAll(): LocalTile[];
}

export class LocalTileDataAccessImpl implements LocalTileDataAccess {

	private readonly tileDatabase: TileDatabase;
	private readonly gameSessionDatabase: GameSessionDatabase;

	constructor(tileDatabase: TileDatabase, gameSessionDatabase: GameSessionDatabase) {
		this.tileDatabase = tileDatabase;
		this.gameSessionDatabase = gameSessionDatabase;
	}

	getAll(): LocalTile[] {
		const selected = this.getIdSelected();
		return this.tileDatabase.queryMany(TileDatabase.QUERY_ALL, null)
			.map(entity => ({
				...entity,
				isSelected: entity.identifier.id === selected?.id,
			}));
	}

	getAt(q: number, r: number): LocalTile | null {
		const entity = this.tileDatabase.querySingle(TileDatabase.QUERY_BY_POSITION, [q, r]);
		if (!entity) {
			return null;
		}
		const selected = this.getIdSelected();
		return {
			...entity,
			isSelected: entity.identifier.id === selected?.id,
		};
	}

	getIdHovered(): LocalTileIdentifier | null {
		return this.gameSessionDatabase.getHoverTile();
	}

	getIdSelected(): LocalTileIdentifier | null {
		return this.gameSessionDatabase.getSelectedTile();
	}

}