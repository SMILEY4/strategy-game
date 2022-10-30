import create from "zustand";
import {City} from "../../../core/models/city";
import {Country} from "../../../core/models/country";
import {Marker} from "../../../core/models/marker";
import {Scout} from "../../../core/models/scout";
import {Tile} from "../../../core/models/tile";
import {generateId} from "../../../shared/utils";
import {SetState} from "../../../shared/zustandUtils";
import {CountryContainer} from "../models/countryContainer";

export namespace WorldStore {

    export interface StateValues {
        revisionId: string,
        currentTurn: number
        countries: CountryContainer,
        tiles: Tile[],
        markers: Marker[],
        scouts: Scout[],
        cities: City[]
    }

    const initialStateValues: StateValues = {
        revisionId: generateId(),
        currentTurn: 0,
        countries: new CountryContainer([]),
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
        ) => void;
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
                countries: new CountryContainer(countries),
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