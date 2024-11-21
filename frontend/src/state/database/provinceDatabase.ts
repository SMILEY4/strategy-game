import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {Province} from "../../models/base/province";

function provideId(e: Province): string {
	return e.identifier.id;
}

interface ProvinceStorageConfig extends DatabaseStorageConfig<Province, string> {
	primary: MapPrimaryStorage<Province, string>,
	supporting: {
		array: ArraySupportingStorage<Province>,
	}
}

class ProvinceStorage extends DatabaseStorage<ProvinceStorageConfig, Province, string> {
	constructor() {
		super({
			primary: new MapPrimaryStorage<Province, string>(provideId),
			supporting: {
				array: new ArraySupportingStorage<Province>(),
			},
		});
	}
}

export class ProvinceDatabase extends AbstractDatabase<ProvinceStorage, Province, string> {
	constructor() {
		super(new ProvinceStorage(), provideId);
	}
}

interface ProvinceQuery<ARGS> extends Query<ProvinceStorage, Province, string, ARGS> {
}


export namespace ProvinceDatabase {

	export const QUERY_BY_ID: ProvinceQuery<string | null> = {
		run(storage: ProvinceStorage, args: string): Province | null {
			if (args === null) {
				return null;
			}
			return storage.config.primary.get(args);
		},
	};

	export const QUERY_BY_SETTLEMENT_ID: ProvinceQuery<string | null> = {
		run(storage: ProvinceStorage, args: string): Province | null {
			if (args === null) {
				return null;
			}
			const result = storage.config.supporting.array.getAll().find(p => p.settlements.some(it => it.id == args));
			return result ? result : null;
		},
	};

	export const QUERY_ALL: ProvinceQuery<void> = {
		run(storage: ProvinceStorage, args: void): Province[] {
			return storage.config.supporting.array.getAll();
		},
	};

}