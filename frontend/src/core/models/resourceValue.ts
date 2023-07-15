import {ResourceType} from "./resourceType";

export interface ResourceValue {
    type: ResourceType,
    value: number,
    change: number
}