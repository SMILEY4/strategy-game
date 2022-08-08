import create, {SetState} from "zustand";
import {City} from "../../../models/state/city";
import {Marker} from "../../../models/state/marker";
import {Tile} from "../../../models/state/tile";

export namespace GameStore {

    interface StateValues {
        currentTurn: number
        map: Tile[],
        markers: Marker[],
        cities: City[]
    }

    const initialStateValues: StateValues = {
        currentTurn: 0,
        map: [],
        markers: [],
        cities: []
    };

    interface StateActions {
        setCurrentTurn: (turn: number) => void
        setTiles: (tiles: Tile[]) => void
        setMarkers: (markers: Marker[]) => void
        setCities: (cities: City[]) => void
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setCurrentTurn: (turn: number) => set(() => ({
                currentTurn: turn,
            })),
            setTiles: (tiles: Tile[]) => set(() => ({
                map: tiles,
            })),
            setMarkers: (markers: Marker[]) => set(() => ({
                markers: markers,
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