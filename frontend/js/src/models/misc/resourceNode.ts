import {ResourceTypeMsg} from "../messages/gameStateMessage";
import {ResourceType} from "./resourceType";

export interface ResourceNode {
    type: ResourceType,
    amount: number,
    maxAmount: number,
    changeRate: number,
    canDeplete: boolean,
}