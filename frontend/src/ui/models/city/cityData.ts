import {CityIdentifier} from "./cityIdentifier";
import {ProvinceIdentifier} from "../province/provinceIdentifier";
import {CountryIdentifier} from "../country/countryIdentifier";
import {ResourceBalanceData} from "../resourceBalanceData";

export interface CityData {
    identifier: CityIdentifier,
    province: ProvinceIdentifier,
    country: CountryIdentifier,
    isCountryCapitol: boolean,
    isProvinceCapitol: boolean,
    population: {
        size: number,
        progress: number // -1 to +1
    },
    resources: ResourceBalanceData[]
}