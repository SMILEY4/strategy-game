import {AbstractSingletonDatabase} from "./database/abstractSingletonDatabase";

interface TestEntity {
    id: string,
    size: number,
    nested: {
        value: string
    }
}

class TestDatabase extends AbstractSingletonDatabase<TestEntity> {

}

describe("singleton database", () => {

    describe("crud", () => {

        test("set", () => {
            const db = new TestDatabase({id: "1", size: 1, nested: {value: "a"}})
            expect(db.get().id).toBe("1")

            const callback = jest.fn();
            db.subscribe(callback);

            db.set({id: "2", size: 2, nested: {value: "2"}})
            expect(db.get().id).toBe("2")

            db.set({id: "3", size: 3, nested: {value: "3"}})
            expect(db.get().id).toBe("3")

            expect(callback.mock.calls).toHaveLength(2)
            expectCallback(callback.mock.calls[0], "2", 2)
            expectCallback(callback.mock.calls[1], "3", 3)
        })

        test("update", () => {
            const db = new TestDatabase({id: "1", size: 1, nested: {value: "a"}})
            expect(db.get().id).toBe("1")

            const callback = jest.fn();
            db.subscribe(callback);

            db.update(e => ({size: e.size+10}))
            expect(db.get().size).toBe(11)

            db.update(e => ({size: e.size+10}))
            expect(db.get().size).toBe(21)

            expect(callback.mock.calls).toHaveLength(2)
            expectCallback(callback.mock.calls[0], "1", 11)
            expectCallback(callback.mock.calls[1], "1", 21)
        })

    })

    describe("subscribers", () => {

        test("subscribe", () => {
            const db = new TestDatabase({id: "1", size: 1, nested: {value: "a"}})

            const callback = jest.fn();
            const subscriberId = db.subscribe(callback);

            db.update(e => ({size: e.size+10}))
            db.set({id: "2", size: 2, nested: {value: "b"}})

            db.unsubscribe(subscriberId)

            db.update(e => ({size: e.size+10}))

            expect(callback.mock.calls).toHaveLength(2)
            expectCallback(callback.mock.calls[0], "1", 11)
            expectCallback(callback.mock.calls[1], "2", 2)
        })

        test("transaction", () => {
            const db = new TestDatabase({id: "1", size: 1, nested: {value: "a"}})

            const callback = jest.fn();
            db.subscribe(callback);

            db.startTransaction()

            db.update(e => ({size: e.size+10}))
            db.set({id: "2", size: 2, nested: {value: "b"}})
            db.update(e => ({size: e.size+10}))

            expect(callback.mock.calls).toHaveLength(0)

            db.endTransaction()

            expect(callback.mock.calls).toHaveLength(1)
            expectCallback(callback.mock.calls[0], "2", 12)
        })

    })

})

function expectCallback(call: any, id: string, size: number) {
    expect(call[0].id).toBe(id)
    expect(call[0].size).toBe(size)
}
