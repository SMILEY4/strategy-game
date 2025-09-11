import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {MapMultikeySupportingStorage} from "../../common/db/storage/supporting/mapMultikeySupportingStorage";
import {RouteEntity} from "../../models/route/routeEntity";

function provideId(e: RouteEntity): string {
	return e.id;
}

function provideSettlementIds(e: RouteEntity): string[] {
	return [e.settlementA.id, e.settlementB.id];
}

interface RouteStorageConfig extends DatabaseStorageConfig<RouteEntity, string> {
	primary: MapPrimaryStorage<RouteEntity, string>,
	supporting: {
		array: ArraySupportingStorage<RouteEntity>,
		bySettlement: MapMultikeySupportingStorage<RouteEntity, string>
	}
}

class RouteStorage extends DatabaseStorage<RouteStorageConfig, RouteEntity, string> {

	public static toKey(q: number, r: number): string {
		return q + "/" + r;
	}

	constructor() {
		super({
			primary: new MapPrimaryStorage<RouteEntity, string>(provideId),
			supporting: {
				array: new ArraySupportingStorage<RouteEntity>(),
				bySettlement: new MapMultikeySupportingStorage<RouteEntity, string>(provideSettlementIds),
			},
		});
	}
}

export class RouteDatabase extends AbstractDatabase<RouteStorage, RouteEntity, string> {
	constructor() {
		super(new RouteStorage(), provideId);
	}
}

interface RouteQuery<ARGS> extends Query<RouteStorage, RouteEntity, string, ARGS> {
}


export namespace RouteDatabase {

	export const QUERY_BY_ID: RouteQuery<string | null> = {
		run(storage: RouteStorage, args: string): RouteEntity | null {
			if (args === null) {
				return null;
			}
			return storage.config.primary.get(args);
		},
	};

	export const QUERY_BY_SETTLEMENT: RouteQuery<string | null> = {
		run(storage: RouteStorage, args: string | null): RouteEntity[] {
			if (args == null) {
				return [];
			}
			return storage.config.supporting.bySettlement.getByKey(args);
		},
	};

	export const QUERY_ALL: RouteQuery<void> = {
		run(storage: RouteStorage, args: void): RouteEntity[] {
			return storage.config.supporting.array.getAll();
		},
	};

}