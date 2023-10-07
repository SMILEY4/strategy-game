import {Country} from "../../models/country";
import {Province} from "../../models/province";
import {City} from "../../models/city";
import {TileContainer} from "../../models/tileContainer";


export interface RemoteGameState {
    countries: Country[],
    provinces: Province[],
    cities: City[]
    tiles: TileContainer;
}

export const INITIAL_REMOTE_GAME_STATE: RemoteGameState = {
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
                        },
                    ],
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
                        },
                    ],
                },
            ],
        },
    ],
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
                },
            ],
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
                },
            ],
        },
    ],
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
            resources: [
                {
                    name: "Food",
                    icon: "/resource_icon_food.png",
                    value: 3,
                    contributions: [
                        {reason: "Farm", value: 2},
                        {reason: "Magic", value: 5},
                        {reason: "Population", value: -4},
                    ],
                },
                {
                    name: "Wood",
                    icon: "/resource_icon_wood.png",
                    value: -1,
                    contributions: [
                        {reason: "Woodcutter", value: 1},
                        {reason: "Toolmaker", value: -2},
                    ],
                },
                {
                    name: "Tools",
                    icon: "/resource_icon_tools.png",
                    value: 2,
                    contributions: [
                        {reason: "Toolmaker", value: 2},
                    ],
                },
            ],
            productionQueue: [],
            maxContentSlots: 3,
            content: [
                {
                    icon: "farm.png",
                },
                {
                    icon: "farm.png",
                },
                {
                    icon: "Woodcutter.png",
                },
            ],
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
    tiles: TileContainer.create([], 11),
};
