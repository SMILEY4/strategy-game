import {CountryIdentifier} from "./countryIdentifier";
import {ReducedProvinceData} from "../province/reducedProvinceData";

export interface CountryData {
    identifier: CountryIdentifier
    playerName: string,
    settlers: number | null
    provinces: ReducedProvinceData[]
}