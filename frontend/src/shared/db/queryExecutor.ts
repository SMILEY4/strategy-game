import {Query} from "./query";
import {QueryIndexPlan} from "./queryProcessor";
import {EntityStorage} from "./storage";
import {DBIndex} from "./dbIndex";

export class QueryExecutor<T> {

    public execute(query: Query<T>, indexPlan: QueryIndexPlan<T>, storage: EntityStorage<T>, indices: DBIndex[]): T[] {

        if (indexPlan.fullTableScan) {
            return [];

        } else {
            this.executeIndexFilter(indexPlan);
            return [];
        }
    }

    private executeIndexFilter(indexPlan: QueryIndexPlan<T>) {
        for (let plan of indexPlan.indexPlans) {
            const index = plan.index;
            const matcher = plan.matcher;
            if ("$eq" in matcher) {
                // TODO
            }
            if ("$lt" in matcher) {
                // TODO
            }
        }

    }

}