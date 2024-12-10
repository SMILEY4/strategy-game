import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {Route} from "../../models/base/route";
import {MapMultikeySupportingStorage} from "../../common/db/storage/supporting/mapMultikeySupportingStorage";

function provideId(e: Route): string {
	return e.id;
}

function provideSettlementIds(e: Route): string[] {
	return [e.settlementA.id, e.settlementB.id];
}

interface RouteStorageConfig extends DatabaseStorageConfig<Route, string> {
	primary: MapPrimaryStorage<Route, string>,
	supporting: {
		array: ArraySupportingStorage<Route>,
		bySettlement: MapMultikeySupportingStorage<Route, string>
	}
}

class RouteStorage extends DatabaseStorage<RouteStorageConfig, Route, string> {

	public static toKey(q: number, r: number): string {
		return q + "/" + r;
	}

	constructor() {
		super({
			primary: new MapPrimaryStorage<Route, string>(provideId),
			supporting: {
				array: new ArraySupportingStorage<Route>(),
				bySettlement: new MapMultikeySupportingStorage<Route, string>(provideSettlementIds),
			},
		});
	}
}

export class RouteDatabase extends AbstractDatabase<RouteStorage, Route, string> {
	constructor() {
		super(new RouteStorage(), provideId);
	}
}

interface RouteQuery<ARGS> extends Query<RouteStorage, Route, string, ARGS> {
}


export namespace RouteDatabase {

	export const QUERY_BY_ID: RouteQuery<string | null> = {
		run(storage: RouteStorage, args: string): Route | null {
			if (args === null) {
				return null;
			}
			return storage.config.primary.get(args);
		},
	};

	export const QUERY_BY_SETTLEMENT: RouteQuery<string | null> = {
		run(storage: RouteStorage, args: string | null): Route[] {
			if (args == null) {
				return [];
			}
			return storage.config.supporting.bySettlement.getByKey(args);
		},
	};

	export const QUERY_ALL: RouteQuery<void> = {
		run(storage: RouteStorage, args: void): Route[] {
			return storage.config.supporting.array.getAll();
		},
	};

}