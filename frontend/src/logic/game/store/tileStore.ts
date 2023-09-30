import {SetState} from "../../../shared/zustandUtils";
import create from "zustand";
import {Tile} from "../../../models/tile";


export namespace TileStore {

    interface StateValues {
        tiles: Tile[];
    }


    interface StateActions {
        set: (tiles: Tile[]) => void;
    }


    const initialStateValues: StateValues = {
        tiles: [],
    };


    function stateActions(set: SetState<State>): StateActions {
        return {
            set: (tiles: Tile[]) => set(() => ({
                tiles: tiles,
            })),
        };
    }


    export interface State extends StateValues, StateActions {
    }


    export const useState = create<State>()((set) => ({
        ...initialStateValues,
        ...stateActions(set),
    }));

}
