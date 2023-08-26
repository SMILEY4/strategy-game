import {CityData} from "../models/city/cityData";
import {MockData} from "../pages/ingame/mockData";

export function useCity(cityId: string): CityData {
    return MockData.getCityData(cityId);
}

export function useCancelCurrentProductionQueueEntry(cityId: string) {
    return () => {
        // TODO
        console.log("cancel current production-queue entry in city", cityId);
    };
}

