import {QueryProcessor} from "./queryProcessor";

export interface DBIndex {
    getName: () => string,
    getFieldPath: () => string,
    estimateCost: (op: "eq" | "lt", path: string) => number;
}


export class HashIndex implements DBIndex {

    private readonly name: string;
    private readonly fieldPath: string;

    constructor(name: string, fieldPath: string) {
        this.name = name
        this.fieldPath = fieldPath;
    }

    public getName(): string {
        return this.name;
    }

    public getFieldPath(): string {
        return this.fieldPath;
    }

    public estimateCost(op: "eq" | "lt", path: string): number {
        if (path !== this.fieldPath) {
            return QueryProcessor.FTS_RATING;
        }
        switch (op) {
            case "eq":
                return QueryProcessor.BEST_RATING;
            case "lt":
                return 10;
        }
    }

}


export class BTreeIndex implements DBIndex {

    private readonly name: string;
    private readonly fieldPath: string;

    constructor(name: string, fieldPath: string) {
        this.name = name
        this.fieldPath = fieldPath;
    }

    public getName(): string {
        return this.name;
    }

    public getFieldPath(): string {
        return this.fieldPath;
    }

    public estimateCost(op: "eq" | "lt", path: string): number {
        if (path !== this.fieldPath) {
            return QueryProcessor.FTS_RATING;
        }
        switch (op) {
            case "eq":
                return 10;
            case "lt":
                return QueryProcessor.BEST_RATING;
        }
    }

}