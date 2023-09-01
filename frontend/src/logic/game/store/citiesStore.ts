import {SetState} from "../../../shared/zustandUtils";
import create from "zustand";
import {City} from "../../../models/city";


export namespace CitiesStore {

    interface StateValues {
        cities: City[];
    }


    interface StateActions {
        set: (cities: City[]) => void;
    }


    const initialStateValues: StateValues = {
        cities: [
            {
                identifier: {
                    id: "stuttgart",
                    name: "Stuttgart",
                },
                province: {
                    id: "baden-wurttemberg",
                    name: "Baden-Württemberg",
                },
                country: {
                    id: "germany",
                    name: "Germany",
                },
                tile: {
                    id: "9867",
                    q: -50,
                    r: 29,
                },
                isProvinceCapitol: true,
                isCountryCapitol: false,
                population: {
                    size: 3,
                    progress: 0.4,
                },
                resources: [],
                productionQueue: [],
                maxContentSlots: 3,
                content: [],
            },
            {
                identifier: {
                    id: "heidelberg",
                    name: "Heidelberg",
                },
                province: {
                    id: "baden-wurttemberg",
                    name: "Baden-Württemberg",
                },
                country: {
                    id: "germany",
                    name: "Germany",
                },
                tile: {
                    id: "4537",
                    q: 12,
                    r: 83,
                },
                isProvinceCapitol: true,
                isCountryCapitol: false,
                population: {
                    size: 3,
                    progress: 0.4,
                },
                resources: [],
                productionQueue: [],
                maxContentSlots: 3,
                content: [],
            },
            {
                identifier: {
                    id: "munchen",
                    name: "München",
                },
                province: {
                    id: "bayern",
                    name: "Bayern",
                },
                country: {
                    id: "germany",
                    name: "Germany",
                },
                tile: {
                    id: "432478",
                    q: 78,
                    r: -48,
                },
                isProvinceCapitol: true,
                isCountryCapitol: false,
                population: {
                    size: 3,
                    progress: 0.4,
                },
                resources: [],
                productionQueue: [],
                maxContentSlots: 3,
                content: [],
            },
            {
                identifier: {
                    id: "augsburg",
                    name: "Augsburg",
                },
                province: {
                    id: "bayern",
                    name: "Bayern",
                },
                country: {
                    id: "germany",
                    name: "Germany",
                },
                tile: {
                    id: "78964",
                    q: 59,
                    r: -73,
                },
                isProvinceCapitol: true,
                isCountryCapitol: false,
                population: {
                    size: 3,
                    progress: 0.4,
                },
                resources: [],
                productionQueue: [],
                maxContentSlots: 3,
                content: [],
            },
            {
                identifier: {
                    id: "nurnberg",
                    name: "Nürnberg",
                },
                province: {
                    id: "bayern",
                    name: "Bayern",
                },
                country: {
                    id: "germany",
                    name: "Germany",
                },
                tile: {
                    id: "1046",
                    q: -3,
                    r: -77,
                },
                isProvinceCapitol: true,
                isCountryCapitol: false,
                population: {
                    size: 3,
                    progress: 0.4,
                },
                resources: [],
                productionQueue: [],
                maxContentSlots: 3,
                content: [],
            },
        ],
    };


    function stateActions(set: SetState<State>): StateActions {
        return {
            set: (cities: City[]) => set(() => ({
                cities: cities,
            })),
        };
    }


    export interface State extends StateValues, StateActions {
    }


    export const useState = create<State>()((set) => ({
        ...initialStateValues,
        ...stateActions(set),
    }));

}
