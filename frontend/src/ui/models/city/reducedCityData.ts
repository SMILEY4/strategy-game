import {CityIdentifier} from "./cityIdentifier";
import {ProvinceIdentifier} from "../province/provinceIdentifier";
import {CountryIdentifier} from "../country/countryIdentifier";

export interface ReducedCityData {
    identifier: CityIdentifier,
    province: ProvinceIdentifier,
    country: CountryIdentifier,
    isCountryCapitol: boolean,
    isProvinceCapitol: boolean,
}