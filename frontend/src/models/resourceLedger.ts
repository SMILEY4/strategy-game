import {ResourceType} from "./resourceType";
import {DetailLogEntry} from "./detailLogEntry";

export interface ResourceLedger {
    entries: ResourceLedgerEntry[],
}

export interface ResourceLedgerEntry {
    resourceType: ResourceType,
    amount: number,
    missing: number,
    details: DetailLogEntry<ResourceLedgerDetailType>[]
}

export type ResourceLedgerDetailType =
    "UNKNOWN_CONSUMPTION"
    | "UNKNOWN_PRODUCTION"
    | "UNKNOWN_MISSING"
    | "BUILDING_CONSUMPTION"
    | "BUILDING_PRODUCTION"
    | "BUILDING_MISSING"
    | "POPULATION_BASE_CONSUMPTION"
    | "POPULATION_BASE_MISSING"
    | "POPULATION_GROWTH_CONSUMPTION"
    | "POPULATION_GROWTH_MISSING"
    | "PRODUCTION_QUEUE_CONSUMPTION"
    | "PRODUCTION_QUEUE_MISSING"
    | "PRODUCTION_QUEUE_REFUND"
    | "SHARED_GIVE"
    | "SHARED_TAKE"

export const RESOURCE_LEDGER_DETAIL_TYPE_CLASSIFICATIONS: Record<ResourceLedgerDetailType, "consumption" | "production" | "missing"> = {
    BUILDING_CONSUMPTION: "consumption",
    BUILDING_MISSING: "missing",
    BUILDING_PRODUCTION: "production",
    POPULATION_BASE_CONSUMPTION: "consumption",
    POPULATION_BASE_MISSING: "missing",
    POPULATION_GROWTH_CONSUMPTION: "consumption",
    POPULATION_GROWTH_MISSING: "missing",
    PRODUCTION_QUEUE_CONSUMPTION: "consumption",
    PRODUCTION_QUEUE_MISSING: "missing",
    PRODUCTION_QUEUE_REFUND: "production",
    SHARED_GIVE: "consumption",
    SHARED_TAKE: "production",
    UNKNOWN_CONSUMPTION: "consumption",
    UNKNOWN_MISSING: "missing",
    UNKNOWN_PRODUCTION: "production",
};