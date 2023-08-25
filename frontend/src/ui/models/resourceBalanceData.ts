export interface ResourceBalanceData {
    name: string,
    icon: string,
    value: number,
    contributions: ({
        reason: string,
        value: number
    })[]
}