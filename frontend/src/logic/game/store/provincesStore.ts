import {SetState} from "../../../shared/zustandUtils";
import create from "zustand";
import {Province} from "../../../models/province";


export namespace ProvincesStore {

    interface StateValues {
        provinces: Province[];
    }


    interface StateActions {
        set: (provinces: Province[]) => void;
    }


    const initialStateValues: StateValues = {
        provinces: [
            {
                identifier: {
                    id: "baden-wurttemberg",
                    name: "Baden-Württemberg",
                },
                country: {
                    id: "germany",
                    name: "Germany",
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
                country: {
                    id: "germany",
                    name: "Germany",
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
    };


    function stateActions(set: SetState<State>): StateActions {
        return {
            set: (provinces: Province[]) => set(() => ({
                provinces: provinces,
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
