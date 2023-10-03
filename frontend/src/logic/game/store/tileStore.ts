import {SetState} from "../../../shared/zustandUtils";
import create from "zustand";
import {Tile} from "../../../models/tile";


export namespace TileStore {

    interface StateValues {
        tiles: Map<string, Tile>
    }

    interface StateActions {
        set: (tiles: Tile[]) => void;
    }

    const initialStateValues: StateValues = {
        tiles: new Map<string, Tile>()
    };


    function stateActions(set: SetState<State>): StateActions {
        return {
            set: (tiles: Tile[]) => set(() => ({
                tiles: buildMap(tiles)
            })),
        };
    }

    function buildMap(tiles: Tile[]): Map<string, Tile> {
        return null as any;
    }


    export interface State extends StateValues, StateActions {
    }

    export const useState = create<State>()((set) => ({
        ...initialStateValues,
        ...stateActions(set),
    }));

}
