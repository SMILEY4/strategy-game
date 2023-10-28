import {ResourceType} from "./resourceType";

export interface ResourceBalance {
    type: ResourceType,
    value: number,
    contributions: ({
        reason: string,
        value: number
    })[]
}