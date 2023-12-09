import {Database} from "./database";
import {BTreeIndex, IndexDefinitions, MapIndex} from "./dbIndex";
import {MapStorage} from "./dbStorage";
import {CountryIdentifier} from "../../models/country";
import {Query} from "./query";

export interface CountryDbIndices extends IndexDefinitions<CountryIdentifier> {
    countryId: MapIndex<CountryIdentifier, string>,
    countryName: MapIndex<CountryIdentifier, string>
    settlerCount: BTreeIndex<CountryIdentifier, number>
}


const db = new Database<CountryIdentifier, CountryDbIndices>(
    new MapStorage<CountryIdentifier>(),
    {
        countryId: new MapIndex<CountryIdentifier, string>({
            keyProvider: entity => entity.id,
        }),
        countryName: new MapIndex<CountryIdentifier, string>({
            keyProvider: entity => entity.name,
        }),
        settlerCount: new BTreeIndex<CountryIdentifier, number>({
            keyProvider: _ => 4,
        }),
    },
);

export function testDB() {

    const query1 = Query.build<CountryIdentifier, CountryDbIndices, number>()
        .matchMultiple((indices, arg) => indices.settlerCount.getRange(0, arg))
        .filter(country => country.name.startsWith("test"))
        .take(2)
        .iterate(e => console.log(e));

    db.query(query1, 4);


    const query2 = Query.build<CountryIdentifier, CountryDbIndices, number>()
        .matchMultiple((indices, arg) => indices.settlerCount.getRange(0, arg))
        .filter(country => country.name.startsWith("test"))
        .take(2)
        .return();

    const result2: CountryIdentifier[] = db.query(query2, 4);


    const query3 = Query.build<CountryIdentifier, CountryDbIndices, number>()
        .matchMultiple((indices, arg) => indices.settlerCount.getRange(0, arg))
        .filter(country => country.name.startsWith("test"))
        .takeOne()
        .return();

    const result3: CountryIdentifier | undefined = db.query(query3, 4);


    const query4 = Query.build<CountryIdentifier, CountryDbIndices, string>()
        .matchSingle((indices, arg) => indices.countryId.get(arg))
        .filter(country => country.name.startsWith("test"))
        .return();

    const result4: CountryIdentifier | undefined = db.query(query4, "myid");

}


