import {CountryIdentifier} from "./country";
import {CityReduced} from "./city";
import {Color} from "./color";
import {ResourceType} from "./resourceType";
import {InfoVisibility} from "./infoVisibility";
import {ResourceLedger} from "./resourceLedger";

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
    cities: CityReduced[];
    resourceLedger: ResourceLedger | null;
}


export interface ProvinceView {
    isPlayerOwned: boolean,
    identifier: ProvinceIdentifier;
    country: CountryIdentifier;
    cities: {
        visibility: InfoVisibility,
        items: CityReduced[]
    };
    resourceLedger: {
        visibility: InfoVisibility,
        ledger: ResourceLedger
    }
}