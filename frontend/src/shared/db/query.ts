import {IndexDefinitions, IndexMultiResponse, IndexSingleResponse} from "./dbIndex";

export interface Query<ENTITY, INDEX extends IndexDefinitions<ENTITY>, ARG, OUT> {
    matchSingle: null | ((indices: INDEX, args: ARG) => IndexSingleResponse),
    matchMultiple: null | ((indices: INDEX, args: ARG) => IndexMultiResponse),
    filters: ((entity: ENTITY) => boolean)[],
    take: number | null,
    return: boolean
    iterator: null | ((entity: ENTITY) => void)
}


export namespace Query {

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

        public matchAll(): PostMatchSingleBuilder<ENTITY, INDEX, ARG> {
            this.query.matchSingle = null
            this.query.matchMultiple = null
            return new PostMatchSingleBuilder<ENTITY, INDEX, ARG>(this.query);
        }

        public matchSingle(match: (indices: INDEX, args: ARG) => IndexSingleResponse): PostMatchSingleBuilder<ENTITY, INDEX, ARG> {
            this.query.matchSingle = match;
            this.query.matchMultiple = null
            return new PostMatchSingleBuilder<ENTITY, INDEX, ARG>(this.query);
        }

        public matchMultiple(match: (indices: INDEX, args: ARG) => IndexMultiResponse): PostMatchMultipleBuilder<ENTITY, INDEX, ARG> {
            this.query.matchSingle = null
            this.query.matchMultiple = match;
            return new PostMatchMultipleBuilder<ENTITY, INDEX, ARG>(this.query);
        }

    }


    export class PostMatchMultipleBuilder<ENTITY, INDEX extends IndexDefinitions<ENTITY>, ARG> {

        private readonly query: Query<ENTITY, INDEX, ARG, void>;

        constructor(query: Query<ENTITY, INDEX, ARG, void>) {
            this.query = query;
        }


        public filter(condition: (entity: ENTITY) => boolean): PostMatchMultipleBuilder<ENTITY, INDEX, ARG> {
            this.query.filters.push(condition);
            return this;
        }

        public take(amount: number): PostTakeMultipleBuilder<ENTITY, INDEX, ARG> {
            this.query.take = amount;
            return new PostTakeMultipleBuilder<ENTITY, INDEX, ARG>(this.query);
        }

        public takeOne(): PostTakeSingleBuilder<ENTITY, INDEX, ARG> {
            this.query.take = 1;
            return new PostTakeSingleBuilder<ENTITY, INDEX, ARG>(this.query);
        }

        public return(): Query<ENTITY, INDEX, ARG, ENTITY[]> {
            return new PostTakeMultipleBuilder(this.query).return();
        }

        public iterate(action: (entity: ENTITY) => void): Query<ENTITY, INDEX, ARG, void> {
            return new PostTakeMultipleBuilder(this.query).iterate(action);
        }

    }

    export class PostMatchSingleBuilder<ENTITY, INDEX extends IndexDefinitions<ENTITY>, ARG> {

        private readonly query: Query<ENTITY, INDEX, ARG, void>;

        constructor(query: Query<ENTITY, INDEX, ARG, void>) {
            this.query = query;
        }


        public filter(condition: (entity: ENTITY) => boolean): PostMatchSingleBuilder<ENTITY, INDEX, ARG> {
            this.query.filters.push(condition);
            return this;
        }

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


        public return(): Query<ENTITY, INDEX, ARG, ENTITY[]> {
            this.query.return;
            return this.query;
        }

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


        public return(): Query<ENTITY, INDEX, ARG, ENTITY | undefined> {
            this.query.return;
            return this.query;
        }

    }
}

