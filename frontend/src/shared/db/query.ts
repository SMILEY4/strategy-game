import {IndexDefinitions, IndexMultiResponse, IndexSingleResponse} from "./dbIndex";

/**
 * @template ENTITY the type of the stored entities
 * @template INDEX the index definition
 * @template ARG the type of the dynamic argument object
 * @template OUT the final return value (usually "ENTITY" / "ENTITY[]" when directly returning or "void" when iterating)
 */
export interface Query<ENTITY, INDEX extends IndexDefinitions<ENTITY>, ARG, OUT> {
    matchSingle: null | ((indices: INDEX, args: ARG) => IndexSingleResponse),
    matchMultiple: null | ((indices: INDEX, args: ARG) => IndexMultiResponse),
    filters: ((entity: ENTITY) => boolean)[],
    take: number | null,
    return: boolean
    iterator: null | ((entity: ENTITY) => void)
}


export namespace Query {

    /**
     * Start building a new query
     */
    export function build<ENTITY, INDEX extends IndexDefinitions<ENTITY>, ARG>(): MatchBuilder<ENTITY, INDEX, ARG> {
        return new MatchBuilder<ENTITY, INDEX, ARG>({
            matchSingle: null,
            matchMultiple: null,
            filters: [],
            take: null,
            return: false,
            iterator: null,
        });
    }


    export class MatchBuilder<ENTITY, INDEX extends IndexDefinitions<ENTITY>, ARG> {

        private readonly query: Query<ENTITY, INDEX, ARG, void>;

        constructor(query: Query<ENTITY, INDEX, ARG, void>) {
            this.query = query;
        }

        /**
         * Initially match all existing entities
         */
        public matchAll(): PostMatchSingleBuilder<ENTITY, INDEX, ARG> {
            this.query.matchSingle = null;
            this.query.matchMultiple = null;
            return new PostMatchSingleBuilder<ENTITY, INDEX, ARG>(this.query);
        }

        /**
         * Match a single entity using an index
         */
        public matchSingle(match: (indices: INDEX, args: ARG) => IndexSingleResponse): PostMatchSingleBuilder<ENTITY, INDEX, ARG> {
            this.query.matchSingle = match;
            this.query.matchMultiple = null;
            return new PostMatchSingleBuilder<ENTITY, INDEX, ARG>(this.query);
        }


        /**
         * Match multiple entities using an index
         */
        public matchMultiple(match: (indices: INDEX, args: ARG) => IndexMultiResponse): PostMatchMultipleBuilder<ENTITY, INDEX, ARG> {
            this.query.matchSingle = null;
            this.query.matchMultiple = match;
            return new PostMatchMultipleBuilder<ENTITY, INDEX, ARG>(this.query);
        }

    }


    export class PostMatchMultipleBuilder<ENTITY, INDEX extends IndexDefinitions<ENTITY>, ARG> {

        private readonly query: Query<ENTITY, INDEX, ARG, void>;

        constructor(query: Query<ENTITY, INDEX, ARG, void>) {
            this.query = query;
        }


        /**
         * Manually filter the matched entities
         * @param condition
         */
        public filter(condition: (entity: ENTITY) => boolean): PostMatchMultipleBuilder<ENTITY, INDEX, ARG> {
            this.query.filters.push(condition);
            return this;
        }

        /**
         * Only take a given amount of the matched entities
         */
        public take(amount: number): PostTakeMultipleBuilder<ENTITY, INDEX, ARG> {
            this.query.take = amount;
            return new PostTakeMultipleBuilder<ENTITY, INDEX, ARG>(this.query);
        }

        /**
         * Only take the first of the matched entities
         */
        public takeOne(): PostTakeSingleBuilder<ENTITY, INDEX, ARG> {
            this.query.take = 1;
            return new PostTakeSingleBuilder<ENTITY, INDEX, ARG>(this.query);
        }

        /**
         * Return the queried entities directly
         */
        public return(): Query<ENTITY, INDEX, ARG, ENTITY[]> {
            return new PostTakeMultipleBuilder(this.query).return();
        }

        /**
         * Iterate over the queried entities
         */
        public iterate(action: (entity: ENTITY) => void): Query<ENTITY, INDEX, ARG, void> {
            return new PostTakeMultipleBuilder(this.query).iterate(action);
        }

    }

    export class PostMatchSingleBuilder<ENTITY, INDEX extends IndexDefinitions<ENTITY>, ARG> {

        private readonly query: Query<ENTITY, INDEX, ARG, void>;

        constructor(query: Query<ENTITY, INDEX, ARG, void>) {
            this.query = query;
        }


        /**
         * Manually filter the matched entity
         * @param condition
         */
        public filter(condition: (entity: ENTITY) => boolean): PostMatchSingleBuilder<ENTITY, INDEX, ARG> {
            this.query.filters.push(condition);
            return this;
        }

        /**
         * Return the queried entity directly
         */
        public return(): Query<ENTITY, INDEX, ARG, ENTITY | undefined> {
            this.query.return;
            return this.query;
        }


    }


    export class PostTakeMultipleBuilder<ENTITY, INDEX extends IndexDefinitions<ENTITY>, ARG> {

        private readonly query: Query<ENTITY, INDEX, ARG, void>;

        constructor(query: Query<ENTITY, INDEX, ARG, void>) {
            this.query = query;
        }


        /**
         * Return the queried entities directly
         */
        public return(): Query<ENTITY, INDEX, ARG, ENTITY[]> {
            this.query.return;
            return this.query;
        }

        /**
         * Iterate over the queried entities
         */
        public iterate(action: (entity: ENTITY) => void): Query<ENTITY, INDEX, ARG, void> {
            this.query.iterator = action;
            return this.query;
        }

    }


    export class PostTakeSingleBuilder<ENTITY, INDEX extends IndexDefinitions<ENTITY>, ARG> {

        private readonly query: Query<ENTITY, INDEX, ARG, void>;

        constructor(query: Query<ENTITY, INDEX, ARG, void>) {
            this.query = query;
        }


        /**
         * Return the queried entity directly
         */
        public return(): Query<ENTITY, INDEX, ARG, ENTITY | undefined> {
            this.query.return;
            return this.query;
        }

    }
}

