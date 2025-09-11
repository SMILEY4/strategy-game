import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {MapUniqueSupportingStorage} from "../../common/db/storage/supporting/mapUniqueSupportingStorage";
import {MapSupportingStorage} from "../../common/db/storage/supporting/mapSupportingStorage";
import {SettlementEntity} from "../../models/settlement/settlementEntity";

function provideId(e: SettlementEntity): string {
	return e.id;
}

interface SettlementStorageConfig extends DatabaseStorageConfig<SettlementEntity, string> {
	primary: MapPrimaryStorage<SettlementEntity, string>,
	supporting: {
		array: ArraySupportingStorage<SettlementEntity>,
		byPos: MapUniqueSupportingStorage<SettlementEntity, string>,
		byCountry: MapSupportingStorage<SettlementEntity, string>
	}
}

class SettlementStorage extends DatabaseStorage<SettlementStorageConfig, SettlementEntity, string> {

	public static toKey(q: number, r: number): string {
		return q + "/" + r;
	}

	constructor() {
		super({
			primary: new MapPrimaryStorage<SettlementEntity, string>(provideId),
			supporting: {
				array: new ArraySupportingStorage<SettlementEntity>(),
				byPos: new MapUniqueSupportingStorage<SettlementEntity, string>(e => SettlementStorage.toKey(e.tile.position.q, e.tile.position.r)),
				byCountry: new MapSupportingStorage<SettlementEntity, string>(e => e.country.id),
			},
		});
	}
}

export class SettlementDatabase extends AbstractDatabase<SettlementStorage, SettlementEntity, string> {
	constructor() {
		super(new SettlementStorage(), provideId);
	}
}

interface SettlementQuery<ARGS> extends Query<SettlementStorage, SettlementEntity, string, ARGS> {
}


export namespace SettlementDatabase {

	export const QUERY_ALL: SettlementQuery<void> = {
		run(storage: SettlementStorage, args: void): SettlementEntity[] {
			return storage.config.supporting.array.getAll();
		},
	};

	export const QUERY_BY_ID: SettlementQuery<string | null> = {
		run(storage: SettlementStorage, args: string): SettlementEntity | null {
			if (args === null) {
				return null;
			}
			return storage.config.primary.get(args);
		},
	};

	export const QUERY_BY_POSITION: SettlementQuery<[number, number]> = {
		run(storage: SettlementStorage, args: [number, number]): SettlementEntity | null {
			return storage.config.supporting.byPos.getByKey(SettlementStorage.toKey(args[0], args[1]));
		},
	};

	export const QUERY_BY_COUNTRY_ID: SettlementQuery<string> = {
		run(storage: SettlementStorage, args: string): SettlementEntity[] {
			return storage.config.supporting.byCountry.getByKey(args);
		},
	};

}