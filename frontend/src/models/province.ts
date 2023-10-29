import {CountryIdentifier} from "./country";
import {CityReduced} from "./city";
import {Color} from "./color";
import {ResourceType} from "./resourceType";
import {InfoVisibility} from "./infoVisibility";

export interface ProvinceIdentifier {
    id: string,
    name: string,
    color: Color,
}

export interface ProvinceReduced {
    identifier: ProvinceIdentifier,
    cities: CityReduced[],
}

export interface Province {
    identifier: ProvinceIdentifier;
    country: CountryIdentifier;
    cities: CityReduced[];
    resourceBalance: Map<ResourceType, number>
}


export interface ProvinceView {
    isPlayerOwned: boolean,
    identifier: ProvinceIdentifier;
    country: CountryIdentifier;
    cities: {
        visibility: InfoVisibility,
        items: CityReduced[]
    };
    resourceBalance: {
        visibility: InfoVisibility,
        items: Map<ResourceType, number>
    }
}