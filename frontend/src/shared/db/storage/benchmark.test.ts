import {MapDatabaseStorage} from "./mapDatabaseStorage";
import {DatabaseStorage} from "./databaseStorage";
import {chooseRandom, shuffleArray} from "../../utils";
import {ArrayDatabaseStorage} from "./arrayDatabaseStorage";

interface TestEntity {
    id: string,
    text: string,
    size: number
}

const OPTIONS_TEXT = [
    "a",
    "b",
    "c",
    "d",
];

function chooseId(index: number): string {
    return "entity_" + index;
}

function chooseText(): string {
    return chooseRandom(OPTIONS_TEXT);
}

function chooseSize(): number {
    return Math.round(Math.random() * 500);
}


function runInsert(storage: DatabaseStorage<TestEntity, string>, n: number): number {
    const entities: TestEntity[] = [];
    for (let i = 0; i < n; i++) {
        const entity: TestEntity = {
            id: chooseId(i),
            text: chooseText(),
            size: chooseSize(),
        };
        entities.push(entity);
    }

    return measure(1, () => {
        for (let i = 0; i < n; i++) {
            storage.insert(entities[i]);
        }
    });
}


function runDelete(storage: DatabaseStorage<TestEntity, string>, n: number): number {
    const ids: string[] = [];
    for (let i = 0; i < n; i++) {
        ids.push(chooseId(i));
    }
    shuffleArray(ids);

    return measure(1, () => {
        for (let i = 0; i < ids.length; i++) {
            storage.delete(ids[i]);
        }
    });
}

function runGet(storage: DatabaseStorage<TestEntity, string>, n: number): number {
    const ids: string[] = [];
    for (let i = 0; i < n; i++) {
        ids.push(chooseId(i));
    }
    shuffleArray(ids);

    return measure(1, () => {
        for (let i = 0; i < ids.length; i++) {
            const x = storage.getById(ids[i]);
        }
    });
}

function runGetAll(storage: DatabaseStorage<TestEntity, string>, n: number): number {
    return measure(n, () => storage.getAll())
}

function measure(n: number, action: () => any): number {
    const ts = Date.now();
    for (let i = 0; i < n; i++) {
        const x = action();
    }
    return Date.now() - ts;
}

function report(name: string, measurements: ([name: string, time: number])[]) {
    let str = ""
    str += "== " + name + " ".padEnd(17, "=") + "\n";
    measurements.forEach(measurement => {
        str += (measurement[0] + " : ").padStart(16) + measurement[1] + "ms" + "\n"
    });
    str += "===============================" + "\n"
    console.log(str)
}

describe("db storage benchmarks", () => {
// describe.skip("db storage benchmarks", () => {

    test("map storage", () => {
        const storage = new MapDatabaseStorage<TestEntity, string>(e => e.id);
        const timeInsert = runInsert(storage, 100_000);
        const timeGet = runGet(storage, 100_000);
        const timeDelete = runDelete(storage, 100_000);
        const timeGetAll = runGetAll(storage, 100_000);
        report("MAP STORAGE", [["insert", timeInsert], ["get", timeGet], ["get-all", timeGetAll], ["delete", timeDelete]]);
    });

    test("array storage", () => {
        const storage = new ArrayDatabaseStorage<TestEntity, string>(e => e.id);
        const timeInsert = runInsert(storage, 100_000);
        const timeGet = runGet(storage, 100_000);
        const timeDelete = runDelete(storage, 100_000);
        const timeGetAll = runGetAll(storage, 100_000);
        report("ARRAY STORAGE", [["insert", timeInsert], ["get", timeGet], ["get-all", timeGetAll], ["delete", timeDelete]]);
    });

});