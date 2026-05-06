import {type ReactElement, StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {DatabaseBuilder} from "@gamedb/database-builder.ts";
import {MapPrimaryDatabaseStorageUnit} from "@gamedb/storage/implementations/database-storage-unit.primary.map.ts";
import {useQuerySingle} from "@gamedb/adapters/use-database.ts";
import type {Query} from "@gamedb/database/query.ts";
import {ArraySupportingStorage} from "@gamedb/storage/implementations/database-storage-unit.supporting.flat-array.ts";

interface Person {
    name: string,
    age: number,
    address: {
        country: string,
        city: string,
        street: string,
    }
}

type PersonStorageMapping = {
    primary: MapPrimaryDatabaseStorageUnit<Person, string>
}

new ArraySupportingStorage<Person>()

const db = DatabaseBuilder
    .create<Person, string, PersonStorageMapping>()
    .withIdProvider(e => e.name)
    .withStorage({
        primary: new MapPrimaryDatabaseStorageUnit(e => e.name),
    })
    .build();

db.insertMany([
    {
        name: "Lukas",
        age: 27,
        address: {
            country: "DE",
            city: "Nürnberg",
            street: "Goethestr.",
        },
    },
    {
        name: "Martin",
        age: 60,
        address: {
            country: "DE",
            city: "Bad Windsheim",
            street: "Berliner Str.",
        },
    },
]);

type PersonQuery<ARGS> = Query<PersonStorageMapping, Person, string, ARGS>

db.insert(    {
    name: "Mr Example",
    age: 42,
    address: {
        country: "DE",
        city: "Exampletown",
        street: "Examplestreet. ",
    },
})

const QUERY_PERSON_BY_ID: PersonQuery<string> = {
    run(storage: PersonStorageMapping, args: string): Person | null {
        return storage.primary.get(args);
    },
};

function incrementAge(id: string) {
    db.update(id, e => ({
        age: e.age + 1,
    }));
}

db.batch(() => {

})

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <button onClick={() => incrementAge("Lukas")}>Age Lukas</button>
        <button onClick={() => incrementAge("Martin")}>Age Martin</button>
        <Person/>
    </StrictMode>,
);


function Person(): ReactElement {

    // const data = useEntity(db, "Lukas");
    const data = useQuerySingle(db, QUERY_PERSON_BY_ID, "Lukas");

    const revId = db.getRevId();

    return (
        <>
            <p>Person</p>
            <ul>
                <p><b>#</b> {revId}</p>
                <p><b>Name: </b> {data?.name}</p>
                <p><b>Age: </b> {data?.age}</p>
                <p><b>Address.Country: </b> {data?.address.country}</p>
                <p><b>Address.City: </b> {data?.address.city}</p>
                <p><b>Address.Street: </b> {data?.address.street}</p>
            </ul>
        </>
    );
}
