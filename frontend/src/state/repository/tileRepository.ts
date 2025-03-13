// import {GameSessionDatabase} from "../database/gameSessionDatabase";
// import {TileDatabase} from "../database/tileDatabase";
// import {Tile, TileIdentifier} from "../../models/base/tile";
// import {usePartialSingletonEntity, useQuerySingle, useQuerySingleOrThrow} from "../../common/db/adapters/databaseHooks";
// import {useDI} from "../../appContext";
//
// export class TileRepository {
//
// 	private readonly gameSessionDb: GameSessionDatabase;
// 	private readonly tileDb: TileDatabase;
//
// 	constructor(
// 		gameSessionDb: GameSessionDatabase,
// 		tileDb: TileDatabase,
// 	) {
// 		this.gameSessionDb = gameSessionDb;
// 		this.tileDb = tileDb;
// 	}
//
// 	public getSelected(): TileIdentifier | null {
// 		return this.gameSessionDb.getSelectedTile();
// 	}
//
// 	public setSelected(tile: TileIdentifier | null) {
// 		this.gameSessionDb.setSelectedTile(tile);
// 	}
//
// 	public getHover(): TileIdentifier | null {
// 		return this.gameSessionDb.getHoverTile();
// 	}
//
// 	public setHover(tile: TileIdentifier | null): void {
// 		return this.gameSessionDb.setHoverTile(tile);
// 	}
//
// 	public getAt(q: number, r: number): Tile | null {
// 		return this.tileDb.querySingle(TileDatabase.QUERY_BY_POSITION, [q, r]);
// 	}
//
// 	public getAll(): Tile[] {
// 		return this.tileDb.queryMany(TileDatabase.QUERY_ALL, null);
// 	}
//
// 	public getTilesRevId(): string {
// 		return this.tileDb.getRevId();
// 	}
//
// }
//
// export namespace TileRepository {
//
// 	export function useByIdOrThrow(tileIdentifier: TileIdentifier): Tile {
// 		const db = useDI<TileDatabase>(TileDatabase.name);
// 		return useQuerySingleOrThrow(db, TileDatabase.QUERY_BY_ID, tileIdentifier.id);
// 	}
//
// 	export function useById(tileIdentifier: TileIdentifier | null | undefined): Tile | null {
// 		const db = useDI<TileDatabase>(TileDatabase.name);
// 		return useQuerySingle(db, TileDatabase.QUERY_BY_ID, tileIdentifier?.id);
// 	}
//
// 	export function useSelected(): TileIdentifier | null {
// 		const db = useDI<GameSessionDatabase>(GameSessionDatabase.name)
// 		return usePartialSingletonEntity(db, e => e.selectedTile)
// 	}
//
// }