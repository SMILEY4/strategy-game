import create, {SetState} from "zustand";
import {City} from "../../../models/city";
import {Marker} from "../../../models/marker";
import {Tile} from "../../../models/tile";

export namespace WorldStore {

    interface StateValues {
        map: Tile[],
        playerMarkers: Marker[],
        cities: City[]
    }

    const initialStateValues: StateValues = {
        map: [],
        playerMarkers: [],
        cities: []
    };

    interface StateActions {
        setTiles: (tiles: Tile[]) => void
        setMarkers: (markers: Marker[]) => void
        setCities: (cities: City[]) => void
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setTiles: (tiles: Tile[]) => set(() => ({
                map: tiles,
            })),
            setMarkers: (markers: Marker[]) => set(() => ({
                playerMarkers: markers,
            })),
            setCities: (cities: City[]) => set(() => ({
                cities: cities,
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