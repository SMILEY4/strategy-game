import {MapPrimaryStorage} from "../../shared/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../shared/db/database/abstractDatabase";
import {Query} from "../../shared/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../shared/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../shared/db/storage/supporting/arraySupportingStorage";
import {Country} from "../../models/primitives/country";

function provideId(e: Country): string {
	return e.identifier.id;
}

interface CountryStorageConfig extends DatabaseStorageConfig<Country, string> {
	primary: MapPrimaryStorage<Country, string>,
	supporting: {
		array: ArraySupportingStorage<Country>,
	}
}

class CountryStorage extends DatabaseStorage<CountryStorageConfig, Country, string> {
	constructor() {
		super({
			primary: new MapPrimaryStorage<Country, string>(provideId),
			supporting: {
				array: new ArraySupportingStorage<Country>(),
			},
		});
	}
}

export class CountryDatabase extends AbstractDatabase<CountryStorage, Country, string> {
	constructor() {
		super(new CountryStorage(), provideId);
	}
}

interface CountryQuery<ARGS> extends Query<CountryStorage, Country, string, ARGS> {
}


export namespace CountryDatabase {

	export const QUERY_BY_ID: CountryQuery<string | null> = {
		run(storage: CountryStorage, args: string): Country | null {
			if (args === null) {
				return null;
			}
			return storage.config.primary.get(args);
		},
	};

	export const QUERY_ALL: CountryQuery<void> = {
		run(storage: CountryStorage, args: void): Country[] {
			return storage.config.supporting.array.getAll();
		},
	};

}