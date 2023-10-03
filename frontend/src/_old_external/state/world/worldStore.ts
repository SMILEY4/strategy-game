import create from "zustand";
import {City} from "../../../_old_core/models/city";
import {Country} from "../../../_old_core/models/country";
import {Marker} from "../../../_old_core/models/marker";
import {Province} from "../../../_old_core/models/province";
import {Route} from "../../../_old_core/models/route";
import {Scout} from "../../../_old_core/models/scout";
import {Tile} from "../../../_old_core/models/tile";
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
        cities: City[],
        provinces: Province[],
        routes: Route[]
    }

    const initialStateValues: StateValues = {
        revisionId: generateId(),
        currentTurn: 0,
        countries: new CountryContainer([]),
        tiles: [],
        markers: [],
        scouts: [],
        cities: [],
        provinces: [],
        routes: []
    };

    interface StateActions {
        setState: (
            currentTurn: number,
            tiles: Tile[],
            countries: Country[],
            cities: City[],
            provinces: Province[],
            markers: Marker[],
            scouts: Scout[],
            routes: Route[]
        ) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setState: (
                currentTurn: number,
                tiles: Tile[],
                countries: Country[],
                cities: City[],
                provinces: Province[],
                markers: Marker[],
                scouts: Scout[],
                routes: Route[]
            ) => set(() => ({
                currentTurn: currentTurn,
                tiles: tiles,
                countries: new CountryContainer(countries),
                cities: cities,
                markers: markers,
                scouts: scouts,
                provinces: provinces,
                routes: routes,
                revisionId: generateId(),
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