import create, {SetState} from "zustand";
import {Marker} from "../../../models/marker";
import {Tile} from "../../../models/tile";

export namespace WorldStore {

    interface StateValues {
        map: Tile[],
        playerMarkers: Marker[],
    }

    const initialStateValues: StateValues = {
        map: [],
        playerMarkers: [],
    };

    interface StateActions {
        setTiles: (tiles: Tile[]) => void
        setMarkers: (markers: Marker[]) => void
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setTiles: (tiles: Tile[]) => set(() => ({
                map: tiles,
            })),
            setMarkers: (markers: Marker[]) => set(() => ({
                playerMarkers: markers,
            })),
        };
    }

    export interface State extends StateValues, StateActions {
    }


    export const useState = create<State>((set: SetState<State>) => ({
        ...initialStateValues,
        ...stateActions(set)
    }));

}