import {useQueryMultiple} from "../../common/db/adapters/databaseHooks";
import {useDI} from "../../appContext";
import {Country} from "../../models/base/country";
import {CountryDatabase} from "../database/countryDatabase";


export namespace CountryRepository {

    export function useAll(): Country[] {
        const db = useDI<CountryDatabase>(CountryDatabase.name);
        return useQueryMultiple(db, CountryDatabase.QUERY_ALL, null)
    }

    export function usePlayerCountry(): Country {
        const db = useDI<CountryDatabase>(CountryDatabase.name);
        const country = useQueryMultiple(db, CountryDatabase.QUERY_ALL, null).find(it => it.identifier.isUserCountry);
        if (country) {
            return country;
        } else {
            throw new Error("Could not find player country.");
        }
    }

}