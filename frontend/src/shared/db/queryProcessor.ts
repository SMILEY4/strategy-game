import {AndCondition, EqualityMatcher, LessThanMatcher, Match, Matcher, OrCondition, Query} from "./query";
import {DBIndex} from "./dbIndex";

export class QueryProcessor<T> {

    static readonly FTS_RATING = 99999999;
    static readonly BEST_RATING = 1;
    static readonly FORCED_RATING = 0;

    public process(query: Query<T>, indices: DBIndex[]): QueryIndexPlan<T> {
        return this.processQuery(query, indices);
    }

    private processQuery(query: Query<T>, indices: DBIndex[]): QueryIndexPlan<T> {
        if ("$or" in query) {
            return this.processOr(query as OrCondition<T>, indices);
        }
        if ("$and" in query) {
            return this.processAnd(query as AndCondition<T>, indices);
        }
        return this.processMatch(query as Match<T>, "", indices);
    }

    private processOr(condition: OrCondition<T>, indices: DBIndex[]): QueryIndexPlan<T> {

        const indexPlans: IndexPlan<T>[] = [];
        let rating = 0;

        for (let query of condition.$or) {
            const result = this.processQuery(query, indices);
            if (result.fullTableScan) {
                return FULL_TABLE_SCAN;
            } else {
                rating += result.rating;
                indexPlans.push(...result.indexPlans);
            }
        }

        // overhead for having to combine results from multiple indices
        rating += (indexPlans.length === 0 ? 0 : indexPlans.length - 1);

        return {
            fullTableScan: false,
            rating: rating,
            indexPlans: indexPlans,
        };
    }

    private processAnd(condition: AndCondition<T>, indices: DBIndex[]): QueryIndexPlan<T> {
        let best: QueryIndexPlan<T> = FULL_TABLE_SCAN;
        for (let query of condition.$and) {
            const result = this.processQuery(query, indices);
            if (result.rating < best.rating) {
                best = result;
            }
        }
        return best;
    }

    private processMatch(match: Match<T>, pathParent: string, indices: DBIndex[]): QueryIndexPlan<T> {
        if (Object.keys(match).length === 0) {
            return FULL_TABLE_SCAN;
        }

        if ("$eq" in match) {
            return this.processEquals(match as EqualityMatcher<T>, pathParent, indices);
        }
        if ("$lt" in match) {
            return this.processLessThan(match as LessThanMatcher<T>, pathParent, indices);
        }

        let bestResult: QueryIndexPlan<T> = FULL_TABLE_SCAN;
        for (const key in match) {
            const path: string = pathParent ? pathParent + "." + key : key;
            const property: { [K in keyof T]: T[K] } = match[key]! as { [K in keyof T]: T[K] };
            const result = this.processMatch(property, path, indices);
            if (result.rating < bestResult.rating) {
                bestResult = result;
            }
        }

        return bestResult;
    }

    private processEquals(operation: EqualityMatcher<T>, path: string, indices: DBIndex[]): QueryIndexPlan<T> {
        const [index, rating] = ("$index" in operation)
            ? this.getIndex(operation.$index!, path, indices)
            : this.getBestIndex("lt", path, indices);
        if (index !== null) {
            return {
                fullTableScan: false,
                indexPlans: [{
                    field: path,
                    matcher: operation,
                    index: index,
                    rating: rating,
                }],
                rating: rating,
            };
        } else {
            return FULL_TABLE_SCAN;
        }
    }

    private processLessThan(operation: LessThanMatcher<T>, path: string, indices: DBIndex[]): QueryIndexPlan<T> {
        const [index, rating] = ("$index" in operation)
            ? this.getIndex(operation.$index!, path, indices)
            : this.getBestIndex("lt", path, indices);
        if (index !== null) {
            return {
                fullTableScan: false,
                indexPlans: [{
                    field: path,
                    matcher: operation,
                    index: index,
                    rating: rating,
                }],
                rating: rating,
            };
        } else {
            return FULL_TABLE_SCAN;
        }
    }


    private getIndex(name: string, path: string, indices: DBIndex[]): [DBIndex | null, number] {
        if (name === "none") {
            return [null, QueryProcessor.FTS_RATING];
        }
        const index = indices.find(i => i.getName() === name && i.getFieldPath() === path);
        if (index) {
            return [index, QueryProcessor.FORCED_RATING];
        } else {
            return [null, QueryProcessor.FTS_RATING];
        }
    }

    private getBestIndex(op: "eq" | "lt", path: string, indices: DBIndex[]): [DBIndex | null, number] {
        let bestRating = QueryProcessor.FTS_RATING;
        let bestIndex: DBIndex | null = null;
        for (let index of indices) {
            const rating = index.estimateCost(op, path);
            if (rating === QueryProcessor.BEST_RATING) {
                return [index, rating];
            }
            if (rating < bestRating) {
                bestRating = rating;
                bestIndex = index;
            }
        }
        if (bestRating === QueryProcessor.FTS_RATING) {
            return [null, QueryProcessor.FTS_RATING];
        } else {
            return [bestIndex, bestRating];
        }
    }


}


export interface QueryIndexPlan<T> {
    fullTableScan: boolean,
    indexPlans: IndexPlan<T>[]
    rating: number
}

export interface IndexPlan<T> {
    field: string,
    matcher: Matcher<T>
    index: DBIndex,
    rating: number
}

const FULL_TABLE_SCAN: QueryIndexPlan<any> = {
    fullTableScan: true,
    indexPlans: [],
    rating: QueryProcessor.FTS_RATING,
};