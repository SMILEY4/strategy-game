import {ResourceType} from "./resourceType";

export interface TradeRoute {
    srcProvinceId: string,
    dstProvinceId: string,
    routeIds: string[],
    resourceType: ResourceType,
    rating: number,
    creationTurn: number,
}