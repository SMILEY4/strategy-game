export interface ResourceBalance {
    name: string,
    icon: string,
    value: number,
    contributions: ({
        reason: string,
        value: number
    })[]
}