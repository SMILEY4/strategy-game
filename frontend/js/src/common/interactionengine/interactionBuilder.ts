export interface TransitionDef<TFrom, TTo> {
    from: TFrom;
    to: TTo;
    action?: () => void | Promise<void>;
}

function createTransitionMap<TState extends string>() {
    return <const TMap extends Record<string, TransitionDef<TState, TState>>>(map: TMap): TMap => map;
}


type StateDef<TAllowedTransitions> = {
    action?: () => void | TAllowedTransitions | Promise<void | TAllowedTransitions>;
}

type AllowedTransitions<TState extends string, TMap extends Record<string, TransitionDef<any, any>>> = {
    [K in keyof TMap]: TMap[K]["from"] extends TState ? K : never;
}[keyof TMap];

function createDefinition<TState extends string, TMap extends Record<string, TransitionDef<any, any>>>() {
    return <const TDef extends { [S in TState]: StateDef<AllowedTransitions<S, TMap>> }>(def: TDef): TDef => def;
}


// USAGE

type MyStates = "WAIT_FOR_SELECT_TILE" | "FINALIZE"

const myTransitionMap = createTransitionMap<MyStates>()({
    CONFIRM_PATH: {
        from: "WAIT_FOR_SELECT_TILE",
        to: "FINALIZE",
    },
    SELECT_TILE: {
        from: "WAIT_FOR_SELECT_TILE",
        to: "WAIT_FOR_SELECT_TILE",
    },
    TEST: {
        from: "FINALIZE",
        to: "WAIT_FOR_SELECT_TILE",
    },
} as const);

const myDefinition = createDefinition<MyStates, typeof myTransitionMap>()({
    WAIT_FOR_SELECT_TILE: {
        action: () => "CONFIRM_PATH",
    },
    FINALIZE: {
        action: () => "TEST",
    },
});


class Interaction 