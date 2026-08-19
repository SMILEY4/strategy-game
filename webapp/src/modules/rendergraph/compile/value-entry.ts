/** A typed value reference: either a compile-time constant or a runtime reference to a data resource. */
export type ValueEntry<T = unknown> =
    | { type: "const", value: T }
    | { type: "ref", ref: string }