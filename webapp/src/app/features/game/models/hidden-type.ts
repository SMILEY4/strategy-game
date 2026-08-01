export type HiddenType<T> =
    | { visible: true, value: T } // idea: "{ visible: true } & T"
    | { visible: false }