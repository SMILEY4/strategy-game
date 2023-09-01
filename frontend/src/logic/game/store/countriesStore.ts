import {SetState} from "../../../shared/zustandUtils";
import create from "zustand";
import {Country} from "../../../models/country";


export namespace CountriesStore {

    interface StateValues {
        countries: Country[];
    }


    interface StateActions {
        set: (countries: Country[]) => void;
    }


    const initialStateValues: StateValues = {
            countries: [
                {
                    identifier: {
                        id: "germany",
                        name: "Germany",
                    },
                    playerName: "smiley_4_",
                    settlers: 3,
                    provinces: [
                        {
                            identifier: {
                                id: "baden-wurttemberg",
                                name: "Baden-Württemberg",
                            },
                            cities: [
                                {
                                    identifier: {
                                        id: "stuttgart",
                                        name: "Stuttgart",
                                    },
                                    isProvinceCapitol: true,
                                    isCountryCapitol: false,
                                },
                                {
                                    identifier: {
                                        id: "heidelberg",
                                        name: "Heidelberg",
                                    },
                                    isProvinceCapitol: false,
                                    isCountryCapitol: false,
                                }
                            ]
                        },
                        {
                            identifier: {
                                id: "bayern",
                                name: "Bayern",
                            },
                            cities: [
                                {
                                    identifier: {
                                        id: "munchen",
                                        name: "München",
                                    },
                                    isProvinceCapitol: true,
                                    isCountryCapitol: false,
                                },
                                {
                                    identifier: {
                                        id: "augsburg",
                                        name: "Augsburg",
                                    },
                                    isProvinceCapitol: true,
                                    isCountryCapitol: true,
                                },
                                {
                                    identifier: {
                                        id: "nurnberg",
                                        name: "Nürnberg",
                                    },
                                    isProvinceCapitol: false,
                                    isCountryCapitol: false,
                                }
                            ]
                        }
                    ],
                }
            ],
    };


    function stateActions(set: SetState<State>): StateActions {
        return {
            set: (countries: Country[]) => set(() => ({
                countries: countries,
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
