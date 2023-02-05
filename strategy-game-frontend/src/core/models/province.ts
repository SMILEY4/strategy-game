import {ResourceType} from "./resourceType";
import {TradeRoute} from "./tradeRoute";

export interface Province {
    provinceId: string,
    countryId: string,
    cityIds: string[],
    provinceCapitalCityId: string,
    resources: Map<ResourceType, number> | null
    tradeRoutes: TradeRoute[]
}
