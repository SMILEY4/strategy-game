import {ArrayExtensions} from "./extensions";

describe("array extensions", () => {

    beforeAll(() => {
        ArrayExtensions.setup()
    })

    describe("sum", () => {

        test("empty array", () => {
            const result: number = [].sum(4, it => it)
            const expected = 4
            expect(result).toEqual(expected)
        })

        test("numbers", () => {
            const result: number = [1, 2, 3, 4, 5].sum(0, it => it)
            const expected = 1 + 2 + 3 + 4 + 5
            expect(result).toEqual(expected)
        })

        test("strings", () => {
            const result: string = ["a", "b", "c"].sum(" - ", it => it)
            const expected = " - abc"
            expect(result).toEqual(expected)
        })

    })

    describe("distinct", () => {

        test("already duplicate numbers", () => {
            const result: number[] = [4, 1, 2, 2, 3, 2, 4, 5].distinct()
            const expected: number[] = [1, 2, 3, 4, 5];
            expect(result.sort()).toEqual(expected.sort())
        });

        test("already distinct numbers", () => {
            const result: number[] = [1, 2, 3, 4, 5].distinct()
            const expected: number[] = [1, 2, 3, 4, 5];
            expect(result.sort()).toEqual(expected.sort())
        });

        test("already duplicate strings", () => {
            const result: string[] = ["4", "1", "2", "2", "3", "2", "4", "5"].distinct()
            const expected: string[] = ["1", "2", "3", "4", "5"];
            expect(result.sort()).toEqual(expected.sort())
        });

        test("already distinct strings", () => {
            const result: string[] = ["1", "2", "3", "4", "5"].distinct()
            const expected: string[] = ["1", "2", "3", "4", "5"];
            expect(result.sort()).toEqual(expected.sort())
        });

        test("duplicate mixed array", () => {
            const result: any[] = [false, null, false, "a", 1, 1, "a", "b", ""].distinct()
            const expected: any[] = [false, null, "a", 1, "b", ""];
            expect(result.sort()).toEqual(expected.sort())
        });

    })

    describe("filterDefined", () => {

        test("single type all defined", () => {
            const result: string[] = ["a", "b", "", "d"].filterDefined()
            const expected: string[] = ["a", "b", "", "d"];
            expect(result.sort()).toEqual(expected.sort())
        })

        test("single type some defined", () => {
            const result: string[] = ["a", null, "b", "", undefined, "d"].filterDefined()
            const expected: string[] = ["a", "b", "", "d"];
            expect(result.sort()).toEqual(expected.sort())
        })

        test("mixed types all defined", () => {
            const result: any[] = ["a", 2, "", false, "b"].filterDefined()
            const expected: any[] = ["a", 2, "", false, "b"];
            expect(result.sort()).toEqual(expected.sort())
        })

        test("mixed types some defined", () => {
            const result: any[] = ["a", 2, null, "", false, undefined, "b"].filterDefined()
            const expected: any[] = ["a", 2, "", false, "b"];
            expect(result.sort()).toEqual(expected.sort())
        })

    })

    describe("associateValue", () => {

        test("basic", () => {
            const result: Map<string, number> = ["1", "4444", "22", "333"].associateValue(e => e.length)
            const expected: ([string, number])[] = [["1", 1], ["22", 2], ["333", 3], ["4444", 4]]
            for (let kvPair of expected) {
                expect(result.get(kvPair[0])).toEqual(kvPair[1])
            }
        })

    })

    describe("associateKey", () => {

        test("basic", () => {
            const result: Map<number, string> = ["1", "4444", "22", "333"].associateKey(e => e.length)
            const expected: ([number, string])[] = [[1, "1"], [2, "22"], [3, "333"], [4, "4444"]]
            for (let kvPair of expected) {
                expect(result.get(kvPair[0])).toEqual(kvPair[1])
            }
        })

    })

    describe("count", () => {

        test("basic", () => {
            const result: number = [1, -2, 3, 4, -5].count(e => e > 0)
            expect(result).toEqual(3)
        })

    })

});