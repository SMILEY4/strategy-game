import {Tile} from "../../models/tile/tile";


export interface StateDefinition<TTransition> {
    transitions: {
        to: MyTransition
    };
}

export interface StateMachine<TTransition extends { id: string }> {
    trigger: (transition: TTransition) => void;
}


export type MyStateIds = "waiting_for_select" | "finalize"

export type MyTransition =
    | { id: "select_tile", tile: Tile.Id }
    | { id: "confirm" }

export type MyStates =
    | { transitions: { to:  } }


function foo(fsm: StateMachine<MyTransition>) {

    fsm.trigger({id: "select_tile", tile: ""});

    fsm.trigger({id: "confirm"});


}