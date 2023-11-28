import {ResourceType} from "./resourceType";

export interface ResourceLedger {
    entries: ResourceLedgerEntry[],
}

export interface ResourceLedgerEntry {
    resourceType: ResourceType,
    amount: number,
    missing: number,
    details: ResourceLedgerDetail[]
}

export interface ResourceLedgerDetail {
    type: "added" | "removed" | "missing"
    amount: number,
    message: string
}