import create, {SetState} from "zustand";
import {City} from "../../../models/state/city";
import {Country} from "../../../models/state/country";
import {Marker} from "../../../models/state/marker";
import {Province} from "../../../models/state/Province";
import {Tile} from "../../../models/state/tile";

export namespace GameStore {

    interface StateValues {
        currentTurn: number
        countries: Country[],
        provinces: Province[],
        tiles: Tile[],
        markers: Marker[],
        cities: City[]
    }

    const initialStateValues: StateValues = {
        currentTurn: 0,
        countries: [],
        provinces: [],
        tiles: [],
        markers: [],
        cities: []
    };

    interface StateActions {
        setCurrentTurn: (turn: number) => void
        setCountries: (countries: Country[]) => void
        setProvinces: (provinces: Province[]) => void,
        setTiles: (tiles: Tile[]) => void
        setMarkers: (markers: Marker[]) => void
        setCities: (cities: City[]) => void
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setCurrentTurn: (turn: number) => set(() => ({
                currentTurn: turn,
            })),
            setCountries: (countries: Country[]) => set(() => ({
                countries: countries,
            })),
            setProvinces: (provinces: Province[]) => set(() => ({
                provinces: provinces,
            })),
            setTiles: (tiles: Tile[]) => set(() => ({
                tiles: tiles,
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