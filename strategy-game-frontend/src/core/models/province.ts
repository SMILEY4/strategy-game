import {ResourceType} from "./resourceType";

export interface Province {
    provinceId: string,
    countryId: string,
    cityIds: string[],
    provinceCapitalCityId: string,
    resources: Map<ResourceType, number> | null
}