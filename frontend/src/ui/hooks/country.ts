import {CountryData} from "../models/country/countryData";
import {MockData} from "../pages/ingame/mockData";

export function useCountry(countryId: string): CountryData {
    return MockData.getCountryData(countryId);
}