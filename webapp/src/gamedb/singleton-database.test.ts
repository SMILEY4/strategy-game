import {describe, expect, test, vi} from "vitest";
import {DatabaseBuilder} from "@gamedb/database-builder.ts";

interface TestEntity {
    id: string,
    size: number,
    nested: {
        value: string
    }
}

describe("singleton database", () => {

    describe("crud", () => {

        test("set", () => {
            const db = DatabaseBuilder.createSingleton<TestEntity>().withInitialValue({id: "1", size: 1, nested: {value: "a"}}).build()
            expect(db.get().id).toBe("1")

            const callback = vi.fn();
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
            const db = DatabaseBuilder.createSingleton<TestEntity>().withInitialValue({id: "1", size: 1, nested: {value: "a"}}).build()
            expect(db.get().id).toBe("1")

            const callback = vi.fn();
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
            const db = DatabaseBuilder.createSingleton<TestEntity>().withInitialValue({id: "1", size: 1, nested: {value: "a"}}).build()

            const callback = vi.fn();
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
            const db = DatabaseBuilder.createSingleton<TestEntity>().withInitialValue({id: "1", size: 1, nested: {value: "a"}}).build()

            const callback = vi.fn();
            db.subscribe(callback);

            db.startBatch()

            db.update(e => ({size: e.size+10}))
            db.set({id: "2", size: 2, nested: {value: "b"}})
            db.update(e => ({size: e.size+10}))

            expect(callback.mock.calls).toHaveLength(0)

            db.endBatch()

            expect(callback.mock.calls).toHaveLength(1)
            expectCallback(callback.mock.calls[0], "2", 12)
        })

    })

})

/* eslint-disable  @typescript-eslint/no-explicit-any */
function expectCallback(call: any, id: string, size: number) {
    expect(call[0].id).toBe(id)
    expect(call[0].size).toBe(size)
}
