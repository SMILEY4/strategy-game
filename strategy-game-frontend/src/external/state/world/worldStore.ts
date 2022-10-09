import create, {SetState} from "zustand";
import {City} from "../../../models/state/city";
import {Country} from "../../../models/state/country";
import {Marker} from "../../../models/state/marker";
import {Scout} from "../../../models/state/scout";
import {Tile} from "../../../models/state/tile";
import {generateId} from "../../../shared/utils";

export namespace WorldStore {

    export interface StateValues {
        revisionId: string,
        currentTurn: number
        countries: Country[],
        tiles: Tile[],
        markers: Marker[],
        scouts: Scout[],
        cities: City[]
    }

    const initialStateValues: StateValues = {
        revisionId: generateId(),
        currentTurn: 0,
        countries: [],
        tiles: [],
        markers: [],
        scouts: [],
        cities: []
    };

    interface StateActions {
        setState: (
            currentTurn: number,
            tiles: Tile[],
            countries: Country[],
            cities: City[],
            markers: Marker[],
            scouts: Scout[]
        ) => void
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setState: (
                currentTurn: number,
                tiles: Tile[],
                countries: Country[],
                cities: City[],
                markers: Marker[],
                scouts: Scout[]
            ) => set(() => ({
                currentTurn: currentTurn,
                tiles: tiles,
                countries: countries,
                cities: cities,
                markers: markers,
                scouts: scouts,
                revisionId: generateId()
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