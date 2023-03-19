import create, {SetState} from "zustand";
import {City} from "../../../models/state/city";
import {Country} from "../../../models/state/country";
import {Marker} from "../../../models/state/marker";
import {Province} from "../../../models/state/Province";
import {Tile} from "../../../models/state/tile";
import {generateId} from "../../../shared/utils";

export namespace GameStore {

    export interface StateValues {
        revisionId: string,
        currentTurn: number
        countries: Country[],
        provinces: Province[],
        tiles: Tile[],
        markers: Marker[],
        cities: City[]
    }

    const initialStateValues: StateValues = {
        revisionId: generateId(),
        currentTurn: 0,
        countries: [],
        provinces: [],
        tiles: [],
        markers: [],
        cities: []
    };

    interface StateActions {
        setState: (
            currentTurn: number,
            tiles: Tile[],
            countries: Country[],
            provinces: Province[],
            cities: City[],
            markers: Marker[]
        ) => void
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setState: (
                currentTurn: number,
                tiles: Tile[],
                countries: Country[],
                provinces: Province[],
                cities: City[],
                markers: Marker[]
            ) => set(() => ({
                currentTurn: currentTurn,
                tiles: tiles,
                countries: countries,
                provinces: provinces,
                cities: cities,
                markers: markers,
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