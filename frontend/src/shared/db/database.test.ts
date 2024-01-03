import {AbstractDatabase} from "./database/abstractDatabase";
import {MapPrimaryStorage} from "./storage/primary/mapPrimaryStorage";
import {Query} from "./query/query";
import {DatabaseOperation} from "./database/databaseOperation";

interface TestEntity {
    id: string,
    size: number,
    nested: {
        value: string
    }
}

class TestStorage extends MapPrimaryStorage<TestEntity, string> {
    constructor() {
        super(e => e.id);
    }
}

class TestDatabase extends AbstractDatabase<TestStorage, TestEntity, string> {
    constructor() {
        super(new TestStorage(), e => e.id);
    }
}

interface TestQuery<ARGS> extends Query<TestStorage, TestEntity, string, ARGS> {
}

const QUERY_SIZE_GREATER_OR_EQUAL: TestQuery<number> = {
    run(storage: TestStorage, args: number): TestEntity[] {
        return storage.getAll().filter(e => e.size >= args).sort((a, b) => a.size - b.size);
    },
};

describe("database", () => {

    describe("crud", () => {

        test("insert single", () => {
            const db = new TestDatabase();
            expect(db.getStorage().count()).toBe(0);

            const callback = jest.fn();
            db.subscribe(callback);

            const id1 = db.insert({id: "1", size: 1, nested: {value: "a"}});
            expect(id1).toBe("1");
            expect(db.getStorage().count()).toBe(1);
            expect(db.getStorage().get("1")?.nested.value).toBe("a");

            const id2 = db.insert({id: "2", size: 2, nested: {value: "b"}});
            expect(id2).toBe("2");
            expect(db.getStorage().count()).toBe(2);
            expect(db.getStorage().get("1")?.nested.value).toBe("a");
            expect(db.getStorage().get("2")?.nested.value).toBe("b");

            expect(callback.mock.calls).toHaveLength(2);
            expectDbCallback(callback.mock.calls[0], ["1"], DatabaseOperation.INSERT);
            expectDbCallback(callback.mock.calls[1], ["2"], DatabaseOperation.INSERT);
        });


        test("insert many", () => {
            const db = new TestDatabase();
            expect(db.getStorage().count()).toBe(0);

            const callback = jest.fn();
            db.subscribe(callback);

            const ids1 = db.insertMany([]);
            expect(ids1).toEqual([]);
            expect(db.getStorage().count()).toBe(0);

            const ids2 = db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
            ]);
            expect(ids2).toEqual(["1", "2"]);
            expect(db.getStorage().count()).toBe(2);
            expect(db.getStorage().get("1")?.nested.value).toBe("a");
            expect(db.getStorage().get("2")?.nested.value).toBe("b");

            expect(callback.mock.calls).toHaveLength(2);
            expectDbCallback(callback.mock.calls[0], [], DatabaseOperation.INSERT);
            expectDbCallback(callback.mock.calls[1], ["1", "2"], DatabaseOperation.INSERT);

        });

        test("delete single", () => {
            const db = new TestDatabase();
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
            ]);

            const callback = jest.fn();
            db.subscribe(callback);

            const deleted = db.delete("2");
            expect(deleted?.id).toBe("2");
            expect(db.getStorage().count()).toBe(1);
            expect(db.getStorage().get("1")).not.toBe(null);
            expect(db.getStorage().get("2")).toBe(null);

            expect(callback.mock.calls).toHaveLength(1);
            expectDbCallback(callback.mock.calls[0], ["2"], DatabaseOperation.DELETE);
        });

        test("delete many", () => {
            const db = new TestDatabase();
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
            ]);

            const callback = jest.fn();
            db.subscribe(callback);

            const deleted = db.deleteMany(["1", "3"]);
            expect(deleted.length).toBe(2);
            expect(deleted[0].id).toBe("1");
            expect(deleted[1].id).toBe("3");
            expect(db.getStorage().count()).toBe(1);
            expect(db.getStorage().get("1")).toBe(null);
            expect(db.getStorage().get("2")).not.toBe(null);
            expect(db.getStorage().get("3")).toBe(null);

            expect(callback.mock.calls).toHaveLength(1);
            expectDbCallback(callback.mock.calls[0], ["1", "3"], DatabaseOperation.DELETE);
        });

        test("delete by query", () => {
            const db = new TestDatabase();
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
            ]);

            const callback = jest.fn();
            db.subscribe(callback);

            const deleted = db.deleteByQuery(QUERY_SIZE_GREATER_OR_EQUAL, 2);
            expect(deleted.length).toBe(2);
            expect(deleted[0].id).toBe("2");
            expect(deleted[1].id).toBe("3");
            expect(db.getStorage().count()).toBe(1);
            expect(db.getStorage().get("1")).not.toBe(null);
            expect(db.getStorage().get("2")).toBe(null);
            expect(db.getStorage().get("3")).toBe(null);

            expect(callback.mock.calls).toHaveLength(1);
            expectDbCallback(callback.mock.calls[0], ["2", "3"], DatabaseOperation.DELETE);
        });

        test("delete all", () => {
            const db = new TestDatabase();
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
            ]);

            const callback = jest.fn();
            db.subscribe(callback);

            const deleted = db.deleteAll();
            expect(deleted.length).toBe(3);
            expect(db.getStorage().get("1")).toBe(null);
            expect(db.getStorage().get("2")).toBe(null);
            expect(db.getStorage().get("3")).toBe(null);

            expect(callback.mock.calls).toHaveLength(1);
            expectDbCallback(callback.mock.calls[0], ["1", "2", "3"], DatabaseOperation.DELETE);
        });

        test("update single", () => {
            const db = new TestDatabase();
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
            ]);

            const callback = jest.fn();
            db.subscribe(callback);

            db.update("2", e => ({size: e.size + 10}));
            expect(db.getStorage().get("2")?.id).toBe("2");
            expect(db.getStorage().get("2")?.size).toBe(12);
            expect(db.getStorage().get("2")?.nested?.value).toBe("b");

            expect(callback.mock.calls).toHaveLength(1);
            expectDbCallback(callback.mock.calls[0], ["2"], DatabaseOperation.MODIFY);
        });


        test("update many", () => {
            const db = new TestDatabase();
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
            ]);

            const callback = jest.fn();
            db.subscribe(callback);

            db.updateMany(["2", "3"], e => ({size: e.size + 10}));
            expect(db.getStorage().get("2")?.id).toBe("2");
            expect(db.getStorage().get("2")?.size).toBe(12);
            expect(db.getStorage().get("2")?.nested?.value).toBe("b");
            expect(db.getStorage().get("3")?.id).toBe("3");
            expect(db.getStorage().get("3")?.size).toBe(13);
            expect(db.getStorage().get("3")?.nested?.value).toBe("c");

            expect(callback.mock.calls).toHaveLength(1);
            expectDbCallback(callback.mock.calls[0], ["2", "3"], DatabaseOperation.MODIFY);
        });


        test("update by query", () => {
            const db = new TestDatabase();
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
            ]);

            const callback = jest.fn();
            db.subscribe(callback);

            db.updateByQuery(QUERY_SIZE_GREATER_OR_EQUAL, 2, e => ({size: e.size + 10}));
            expect(db.getStorage().get("2")?.id).toBe("2");
            expect(db.getStorage().get("2")?.size).toBe(12);
            expect(db.getStorage().get("2")?.nested?.value).toBe("b");
            expect(db.getStorage().get("3")?.id).toBe("3");
            expect(db.getStorage().get("3")?.size).toBe(13);
            expect(db.getStorage().get("3")?.nested?.value).toBe("c");

            expect(callback.mock.calls).toHaveLength(1);
            expectDbCallback(callback.mock.calls[0], ["2", "3"], DatabaseOperation.MODIFY);
        });


        test("replace single", () => {
            const db = new TestDatabase();
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
            ]);

            const callback = jest.fn();
            db.subscribe(callback);

            db.replace("2", e => ({
                id: e.id,
                size: e.size + 10,
                nested: {
                    value: "x",
                },
            }));
            expect(db.getStorage().get("2")?.id).toBe("2");
            expect(db.getStorage().get("2")?.size).toBe(12);
            expect(db.getStorage().get("2")?.nested?.value).toBe("x");

            expect(callback.mock.calls).toHaveLength(1);
            expectDbCallback(callback.mock.calls[0], ["2"], DatabaseOperation.MODIFY);
        });


        test("replace many", () => {
            const db = new TestDatabase();
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
            ]);

            const callback = jest.fn();
            db.subscribe(callback);

            db.updateMany(["2", "3"], e => ({
                id: e.id,
                size: e.size + 10,
                nested: {
                    value: "x",
                },
            }));
            expect(db.getStorage().get("2")?.id).toBe("2");
            expect(db.getStorage().get("2")?.size).toBe(12);
            expect(db.getStorage().get("2")?.nested?.value).toBe("x");
            expect(db.getStorage().get("3")?.id).toBe("3");
            expect(db.getStorage().get("3")?.size).toBe(13);
            expect(db.getStorage().get("3")?.nested?.value).toBe("x");

            expect(callback.mock.calls).toHaveLength(1);
            expectDbCallback(callback.mock.calls[0], ["2", "3"], DatabaseOperation.MODIFY);
        });


        test("replace by query", () => {
            const db = new TestDatabase();
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
            ]);

            const callback = jest.fn();
            db.subscribe(callback);

            db.updateByQuery(QUERY_SIZE_GREATER_OR_EQUAL, 2, e => ({
                id: e.id,
                size: e.size + 10,
                nested: {
                    value: "x",
                },
            }));
            expect(db.getStorage().get("2")?.id).toBe("2");
            expect(db.getStorage().get("2")?.size).toBe(12);
            expect(db.getStorage().get("2")?.nested?.value).toBe("x");
            expect(db.getStorage().get("3")?.id).toBe("3");
            expect(db.getStorage().get("3")?.size).toBe(13);
            expect(db.getStorage().get("3")?.nested?.value).toBe("x");

            expect(callback.mock.calls).toHaveLength(1);
            expectDbCallback(callback.mock.calls[0], ["2", "3"], DatabaseOperation.MODIFY);
        });

        test("query single", () => {
            const db = new TestDatabase();
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
            ]);

            const entity = db.querySingle(QUERY_SIZE_GREATER_OR_EQUAL, 2);
            expect(entity?.id).toBe("2");

        });

        test("query single unknown", () => {
            const db = new TestDatabase();
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
            ]);

            const entity = db.querySingle(QUERY_SIZE_GREATER_OR_EQUAL, 99);
            expect(entity).toBeNull();
        });

        test("query many", () => {
            const db = new TestDatabase();
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
            ]);

            const entities = db.queryMany(QUERY_SIZE_GREATER_OR_EQUAL, 2);
            expect(entities.length).toBe(2);
            const ids = entities.map(e => e.id);
            expect(ids).toContain("2");
            expect(ids).toContain("3");
        });

        test("query many unknown", () => {
            const db = new TestDatabase();
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
            ]);

            const entities = db.queryMany(QUERY_SIZE_GREATER_OR_EQUAL, 99);
            expect(entities.length).toBe(0);
        });

    });

    describe("subscribers", () => {

        test("subscribe on entity", () => {
            const db = new TestDatabase();
            const callback = jest.fn();
            const [subscriberId, _] = db.subscribeOnEntity("2", callback);

            db.insert({id: "1", size: 1, nested: {value: "a"}});
            db.insert({id: "2", size: 2, nested: {value: "b"}}); // 1 insert
            db.delete("1");
            db.delete("2"); // 2 delete
            db.insertMany([
                {id: "2", size: 2, nested: {value: "b"}}, // 3 insert
                {id: "3", size: 3, nested: {value: "c"}},
            ]);
            db.update("1", () => ({size: 99}))
            db.update("2", () => ({size: 99})) // 4 modify
            db.deleteMany(["2", "3"]); // 5 delete
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}}, // 6 insert
                {id: "3", size: 3, nested: {value: "c"}},
            ]);
            db.replaceMany(["1", "2", "3"], e => ({ // 7 modify
                id: e.id,
                size: e.size + 10,
                nested: {
                    value: "x",
                },
            }))
            db.deleteAll(); // 8 delete

            db.unsubscribe(subscriberId);
            db.insert({id: "2", size: 2, nested: {value: "b"}}); // ignore
            db.delete("2"); // ignore

            expect(callback.mock.calls).toHaveLength(8);
            expectEntityCallback(callback.mock.calls[0], "2", DatabaseOperation.INSERT);
            expectEntityCallback(callback.mock.calls[1], "2", DatabaseOperation.DELETE);
            expectEntityCallback(callback.mock.calls[2], "2", DatabaseOperation.INSERT);
            expectEntityCallback(callback.mock.calls[3], "2", DatabaseOperation.MODIFY);
            expectEntityCallback(callback.mock.calls[4], "2", DatabaseOperation.DELETE);
            expectEntityCallback(callback.mock.calls[5], "2", DatabaseOperation.INSERT);
            expectEntityCallback(callback.mock.calls[6], "2", DatabaseOperation.MODIFY);
            expectEntityCallback(callback.mock.calls[7], "2", DatabaseOperation.DELETE);
        });

        test("subscribe query", () => {
            const db = new TestDatabase();
            const callback = jest.fn();
            const [subscriberId, _] = db.subscribeOnQuery(QUERY_SIZE_GREATER_OR_EQUAL, 2, callback);

            db.insert({id: "1", size: 1, nested: {value: "a"}});
            db.insert({id: "2", size: 2, nested: {value: "b"}}); // trigger ["2"]
            db.delete("1");
            db.delete("2"); // trigger []
            db.insertMany([
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},  // trigger ["2", "3"]
            ]);
            db.update("2", () => ({size: 0})) // trigger: ["3"]
            db.deleteMany(["2", "3"]);  // trigger []
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
                {id: "4", size: 4, nested: {value: "d"}}, // trigger ["2", "3", "4"]
            ]);
            db.delete("1");
            db.deleteAll();  // trigger []

            db.unsubscribe(subscriberId);
            db.insert({id: "4", size: 4, nested: {value: "d"}}); // ignore
            db.delete("4");  // ignore

            expect(callback.mock.calls).toHaveLength(7);
            expectQueryCallback(callback.mock.calls[0], ["2"]);
            expectQueryCallback(callback.mock.calls[1], []);
            expectQueryCallback(callback.mock.calls[2], ["2", "3"]);
            expectQueryCallback(callback.mock.calls[3], ["3"]);
            expectQueryCallback(callback.mock.calls[4], []);
            expectQueryCallback(callback.mock.calls[5], ["2", "3", "4"]);
            expectQueryCallback(callback.mock.calls[6], []);
        });

    });

    describe("subscribers with transaction", () => {

        test("subscribers", () => {
            const db = new TestDatabase();

            const callbackOnDb = jest.fn();
            db.subscribe(callbackOnDb);

            const callbackOnEntity = jest.fn();
            db.subscribeOnEntity("2", callbackOnEntity);

            const callbackOnQuery = jest.fn();
            db.subscribeOnQuery(QUERY_SIZE_GREATER_OR_EQUAL, 2, callbackOnQuery);

            db.startTransaction();

            db.insert({id: "2", size: 2, nested: {value: "b"}});
            db.insert({id: "1", size: 1, nested: {value: "a"}});
            db.updateMany(["1", "2"], () => ({size: 0}))
            db.delete("1");
            db.delete("2");
            db.insertMany([
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
            ]);
            db.deleteMany(["2", "3"]);
            db.insertMany([
                {id: "1", size: 1, nested: {value: "a"}},
                {id: "2", size: 2, nested: {value: "b"}},
                {id: "3", size: 3, nested: {value: "c"}},
            ]);

            expect(callbackOnDb.mock.calls).toHaveLength(0);
            expect(callbackOnEntity.mock.calls).toHaveLength(0);
            expect(callbackOnQuery.mock.calls).toHaveLength(0);

            db.endTransaction();

            expect(callbackOnDb.mock.calls).toHaveLength(3);
            expectDbCallback(callbackOnDb.mock.calls[0], ["1", "2", "2", "3"], DatabaseOperation.DELETE);
            expectDbCallback(callbackOnDb.mock.calls[1], ["1", "2"], DatabaseOperation.MODIFY); // 0
            expectDbCallback(callbackOnDb.mock.calls[2], ["2", "1", "2", "3", "1", "2", "3"], DatabaseOperation.INSERT);

            expect(callbackOnEntity.mock.calls).toHaveLength(3);
            expectEntityCallback(callbackOnEntity.mock.calls[0], "2", DatabaseOperation.DELETE);
            expectEntityCallback(callbackOnEntity.mock.calls[1], "2", DatabaseOperation.MODIFY);
            expectEntityCallback(callbackOnEntity.mock.calls[2], "2", DatabaseOperation.INSERT);

            expect(callbackOnQuery.mock.calls).toHaveLength(1);
            expectQueryCallback(callbackOnQuery.mock.calls[0], ["2", "3"]);

        });

    });

});

function expectDbCallback(call: any, ids: string[], op: DatabaseOperation) {
    expect(call[0].length).toBe(ids.length);
    for (let i = 0; i < ids.length; i++) {
        expect(call[0][i].id).toBe(ids[i]);
    }
    expect(call[1]).toBe(op);
}

function expectEntityCallback(call: any, id: string, op: DatabaseOperation) {
    expect(call[0].id).toBe(id);
    expect(call[1]).toBe(op);
}


function expectQueryCallback(call: any, ids: string[]) {
    expect(call[0].length).toBe(ids.length);
    for (let i = 0; i < ids.length; i++) {
        expect(call[0][i].id).toBe(ids[i]);
    }
}