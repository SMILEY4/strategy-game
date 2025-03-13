import {RemoteTile} from "../remoteTile";
import {TileDatabase} from "../../database/tileDatabase";

export interface RemoteTileDataAccess {
	getAll(): RemoteTile[];
	getAt(q: number, r: number): RemoteTile | null;
}

export class RemoteTileDataAccessImpl implements RemoteTileDataAccess {

	private readonly database: TileDatabase;

	constructor(database: TileDatabase) {
		this.database = database;
	}

	getAll(): RemoteTile[] {
		return this.database.queryMany(TileDatabase.QUERY_ALL, null)
			.map(entity => ({
				...entity,
				id: entity.identifier.id,
				position: {
					q: entity.identifier.q,
					r: entity.identifier.r,
				},
			}));
	}

	getAt(q: number, r: number): RemoteTile | null {
		const entity = this.database.querySingle(TileDatabase.QUERY_BY_POSITION, [q, r]);
		if (!entity) {
			return null;
		}
		return {
			...entity,
			id: entity.identifier.id,
			position: {
				q: entity.identifier.q,
				r: entity.identifier.r,
			},
		};
	}

}