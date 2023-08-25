import {ProvinceIdentifier} from "./provinceIdentifier";
import {CountryIdentifier} from "../country/countryIdentifier";
import {ReducedCityData} from "../city/reducedCityData";

export interface ReducedProvinceData {
    identifier: ProvinceIdentifier,
    country: CountryIdentifier,
    cities: ReducedCityData[]
}