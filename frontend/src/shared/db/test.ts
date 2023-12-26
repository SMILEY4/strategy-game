import {Country} from "../../models/country";
import {Color} from "../../models/color";
import {COUNTRY_QUERY_BY_SETTLER_COUNT, CountryDatabase} from "./countryDatabase";


export async function testDB() {

    const db = new CountryDatabase()

    db.insert(createCountry("country1a", "user1", []))
    db.insert(createCountry("country1b", "user1", []))
    db.insert(createCountry("country2", "user2", []))


    const countriesWithoutSettlers = db.queryMany(COUNTRY_QUERY_BY_SETTLER_COUNT, 1)

    db.subscribeOnQuery(COUNTRY_QUERY_BY_SETTLER_COUNT, null, () => {
        console.log("changes!!!")
    })


}


function createCountry(countryId: string, userId: string, provinceIds: string[]): Country {
    return {
        identifier: {
            id: countryId,
            name: countryId,
            color: Color.BLACK,
        },
        player: {
            userId: userId,
            name: userId
        },
        settlers: Math.round(Math.random() * 10),
        provinces: provinceIds.map(id => ({
            identifier: {
                id: id,
                name: id,
                color: Color.BLACK
            },
            cities: [],
            isPlanned: false
        }))
    }
}

