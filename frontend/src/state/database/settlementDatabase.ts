import {MapPrimaryStorage} from "../../shared/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../shared/db/database/abstractDatabase";
import {Query} from "../../shared/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../shared/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../shared/db/storage/supporting/arraySupportingStorage";
import {Settlement} from "../../models/Settlement";
import {WorldObject} from "../../models/worldObject";
import {MapUniqueSupportingStorage} from "../../shared/db/storage/supporting/mapUniqueSupportingStorage";

function provideId(e: Settlement): string {
	return e.identifier.id;
}

interface SettlementStorageConfig extends DatabaseStorageConfig<Settlement, string> {
	primary: MapPrimaryStorage<Settlement, string>,
	supporting: {
		array: ArraySupportingStorage<Settlement>,
		byPos: MapUniqueSupportingStorage<Settlement, string>
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

	export const QUERY_ALL: SettlementQuery<void> = {
		run(storage: SettlementStorage, args: void): Settlement[] {
			return storage.config.supporting.array.getAll();
		},
	};

}