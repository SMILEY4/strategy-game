import create, {SetState} from "zustand";
import {City} from "../../../models/state/city";
import {Country} from "../../../models/state/country";
import {Marker} from "../../../models/state/marker";
import {Province} from "../../../models/state/Province";
import {Scout} from "../../../models/state/scout";
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
        scouts: Scout[],
        cities: City[]
    }

    const initialStateValues: StateValues = {
        revisionId: generateId(),
        currentTurn: 0,
        countries: [],
        provinces: [],
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
            provinces: Province[],
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
                provinces: Province[],
                cities: City[],
                markers: Marker[],
                scouts: Scout[]
            ) => set(() => ({
                currentTurn: currentTurn,
                tiles: tiles,
                countries: countries,
                provinces: provinces,
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