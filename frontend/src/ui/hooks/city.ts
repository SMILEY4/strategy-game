import {CityData} from "../models/city/cityData";
import {MockData} from "../pages/ingame/mockData";
import {ProductionEntry} from "../models/productionEntry";

export function useCity(cityId: string): CityData {
    return MockData.getCityData(cityId);
}

export function useCancelCurrentProductionQueueEntry(cityId: string) {
    return () => {
        console.log("cancel current production-queue entry in city", cityId);
    };
}

export function useAvailableProductionEntries(cityId: string): ProductionEntry[] {
    return [
        {
            name: "Farm",
            icon: "farm.png",
            disabled: false,
        },
        {
            name: "Woodcutter",
            icon: "Woodcutter.png",
            disabled: false,
        },
        {
            name: "Farm II",
            icon: "farm.png",
            disabled: true,
        },
        {
            name: "Woodcutter II",
            icon: "Woodcutter.png",
            disabled: true,
        },
        {
            name: "Settler",
            icon: "Woodcutter.png",
            disabled: false,
        },
    ]
}

export function useAddProductionEntry(cityId: string) {
    return (entry: ProductionEntry) => undefined
}
