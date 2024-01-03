import {CountryIdentifier} from "./country";
import {CityReduced} from "./city";
import {Color} from "./color";
import {ResourceLedger} from "./resourceLedger";
import {HiddenType} from "./hiddenType";

export interface ProvinceIdentifier {
    id: string,
    name: string,
    color: Color,
}

export interface ProvinceReduced {
    identifier: ProvinceIdentifier,
    cities: CityReduced[],
    isPlanned?: boolean,
}

export interface Province {
    identifier: ProvinceIdentifier;
    country: CountryIdentifier;
    isPlayerOwned: boolean;
    cities: CityReduced[];
    resourceLedger: HiddenType<ResourceLedger>;
}


export interface ProvinceView {
    base: Province,
    modified: {
        createdCities: CityReduced[]
    }
}