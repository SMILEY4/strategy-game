import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {Settlement} from "../../models/base/Settlement";
import {MapUniqueSupportingStorage} from "../../common/db/storage/supporting/mapUniqueSupportingStorage";
import {MapSupportingStorage} from "../../common/db/storage/supporting/mapSupportingStorage";

function provideId(e: Settlement): string {
	return e.identifier.id;
}

interface SettlementStorageConfig extends DatabaseStorageConfig<Settlement, string> {
	primary: MapPrimaryStorage<Settlement, string>,
	supporting: {
		array: ArraySupportingStorage<Settlement>,
		byPos: MapUniqueSupportingStorage<Settlement, string>,
		byCountry: MapSupportingStorage<Settlement, string>
	}
}

class SettlementStorage extends DatabaseStorage<SettlementStorageConfig, Settlement, string> {

	public static toKey(q: number, r: number): string {
		return q + "/" + r;
	}

	constructor() {
		super({
			primary: new MapPrimaryStorage<Settlement, string>(provideId),
			supporting: {
				array: new ArraySupportingStorage<Settlement>(),
				byPos: new MapUniqueSupportingStorage<Settlement, string>(e => SettlementStorage.toKey(e.tile.q, e.tile.r)),
				byCountry: new MapSupportingStorage<Settlement, string>(e => e.country.id),
			},
		});
	}
}

export class SettlementDatabase extends AbstractDatabase<SettlementStorage, Settlement, string> {
	constructor() {
		super(new SettlementStorage(), provideId);
	}
}

interface SettlementQuery<ARGS> extends Query<SettlementStorage, Settlement, string, ARGS> {
}


export namespace SettlementDatabase {

	export const QUERY_ALL: SettlementQuery<void> = {
		run(storage: SettlementStorage, args: void): Settlement[] {
			return storage.config.supporting.array.getAll();
		},
	};

	export const QUERY_BY_ID: SettlementQuery<string | null> = {
		run(storage: SettlementStorage, args: string): Settlement | null {
			if (args === null) {
				return null;
			}
			return storage.config.primary.get(args);
		},
	};

	export const QUERY_BY_POSITION: SettlementQuery<[number, number]> = {
		run(storage: SettlementStorage, args: [number, number]): Settlement | null{
			return storage.config.supporting.byPos.getByKey(SettlementStorage.toKey(args[0], args[1]));
		},
	};

	export const QUERY_BY_COUNTRY_ID: SettlementQuery<string> = {
		run(storage: SettlementStorage, args: string): Settlement[]{
			return storage.config.supporting.byCountry.getByKey(args);
		},
	};

}