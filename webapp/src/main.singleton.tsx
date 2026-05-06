import {type ReactElement, StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {DatabaseBuilder} from "@gamedb/database-builder.ts";
import type {SingletonDatabase} from "@gamedb/singleton/singleton-database.ts";
import {usePartialSingletonEntity, useSingletonEntity} from "@gamedb/adapters/use-singleton-database.ts";

interface Person {
    name: string,
    age: number,
    address: {
        country: string,
        city: string,
        street: string,
    }
}

const db: SingletonDatabase<Person> = DatabaseBuilder
    .createSingleton<Person>()
    .withInitialValue({
        name: "Lukas",
        age: 17,
        address: {
            country: "DE",
            city: "Nürnberg",
            street: "Goethestr. 20",
        },
    })
    .build();

function incrementAge() {
    db.update(e => ({
        ...e,
        age: e.age + 1,
    }));
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <button onClick={incrementAge}>Increment Age</button>
        <Person/>
        <PersonNoAge/>
        <PersonOnlyAge/>
    </StrictMode>,
);


function Person(): ReactElement {

    const data = useSingletonEntity<Person>(db);

    const revId = db.getRevId();

    return (
        <>
            <p>Person</p>
            <ul>
                <p><b>#</b> {revId}</p>
                <p><b>Name: </b> {data.name}</p>
                <p><b>Age: </b> {data.age}</p>
                <p><b>Address.Country: </b> {data.address.country}</p>
                <p><b>Address.City: </b> {data.address.city}</p>
                <p><b>Address.Street: </b> {data.address.street}</p>
            </ul>
        </>
    );
}


function PersonNoAge(): ReactElement {

    const data = usePartialSingletonEntity<Person, Omit<Person, "age">>(
        db,
        e => ({
            name: e.name,
            address: e.address
        }),
        (a, b) => {
            return a.address.country === b.address.country
                && a.address.city === b.address.city
                && a.address.street === b.address.street
                && a.name == b.name
        }
    )

    const revId = db.getRevId()

    return (
        <>
            <p>Person (no age)</p>
            <ul>
                <p><b>#</b> {revId}</p>
                <p><b>Name: </b> {data.name}</p>
                <p><b>Address.Country: </b> {data.address.country}</p>
                <p><b>Address.City: </b> {data.address.city}</p>
                <p><b>Address.Street: </b> {data.address.street}</p>
            </ul>
        </>
    );
}


function PersonOnlyAge(): ReactElement {

    const data = usePartialSingletonEntity<Person, number>(db, e => e.age);

    const revId = db.getRevId()

    return (
        <>
            <p>Person (no age)</p>
            <ul>
                <p><b>#</b> {revId}</p>
                <p><b>Age: </b> {data}</p>
            </ul>
        </>
    );
}