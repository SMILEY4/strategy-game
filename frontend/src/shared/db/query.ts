export type Query<T> = OrCondition<T> | AndCondition<T> | Match<T> // todo: rename "match" ?

export type OrCondition<T> = {
    $or: (Match<T> | AndCondition<T> | OrCondition<T>)[]
}

export type AndCondition<T> = {
    $and: (Match<T> | OrCondition<T>)[]
}

export type Match<T> = { // todo: rename "matcher" ?
    [K in keyof T]?: Matcher<T[K]> | Match<T[K]>
}

export type Matcher<V> = EqualityMatcher<V> | LessThanMatcher<V> // todo: rename "operation" ?

export type EqualityMatcher<V> = {// todo: rename "operation" ?
    $eq: V,
    $index?: string
}

export type LessThanMatcher<V> = {// todo: rename "operation" ?
    $lt: V,
    $index?: string
}

