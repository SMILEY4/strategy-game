export type CommandType = "production-queue-entry.add"
    | "production-queue-entry.cancel"
    | "scout.place"
    | "settlement.create"
    | "settlement.upgrade"

export interface Command {
    type: CommandType,
}