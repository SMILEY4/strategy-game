import {Database} from "./database";
import {BTreeIndex, IndexDefinitions, MapIndex} from "./dbIndex";
import {MapStorage} from "./dbStorage";
import {CountryIdentifier} from "../../models/country";
import {query} from "./queryBuilder";

export interface CountryDbIndices extends IndexDefinitions {
    countryId: MapIndex<string>,
    countryName: MapIndex<string>
    settlerCount: BTreeIndex<number>
}


const db = new Database<CountryIdentifier, CountryDbIndices>(
    new MapStorage<CountryIdentifier>(),
    {
        countryId: new MapIndex<string>(),
        countryName: new MapIndex<string>(),
        settlerCount: new BTreeIndex<number>(),
    },
);


const query1 = query<CountryIdentifier, CountryDbIndices, number>()
    .matchMultiple((indices, arg) => indices.settlerCount.getRange(0, arg))
    .filter(country => country.name.startsWith("test"))
    .take(2)
    .iterate(e => console.log(e));

const result1: void = db.query(query1, 4);


const query2 = query<CountryIdentifier, CountryDbIndices, number>()
    .matchMultiple((indices, arg) => indices.settlerCount.getRange(0, arg))
    .filter(country => country.name.startsWith("test"))
    .take(2)
    .return();

const result2: CountryIdentifier[] = db.query(query2, 4);


const query3 = query<CountryIdentifier, CountryDbIndices, number>()
    .matchMultiple((indices, arg) => indices.settlerCount.getRange(0, arg))
    .filter(country => country.name.startsWith("test"))
    .takeOne()
    .return();

const result3: CountryIdentifier | undefined = db.query(query3, 4);


const query4 = query<CountryIdentifier, CountryDbIndices, string>()
    .matchSingle((indices, arg) => indices.countryId.get(arg))
    .filter(country => country.name.startsWith("test"))
    .return();

const result4: CountryIdentifier | undefined = db.query(query4, "myid");
