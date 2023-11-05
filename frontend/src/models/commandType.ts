export type CommandTypeString =
    "production-queue-entry.add"
    | "production-queue-entry.cancel"
    | "scout.place"
    | "settlement.create"
    | "settlement.upgrade";

export class CommandType {

    public static readonly PRODUCTION_QUEUE_ADD = new CommandType("production-queue-entry.add");
    public static readonly PRODUCTION_QUEUE_CANCEL = new CommandType("production-queue-entry.cancel");
    public static readonly SCOUT_PLACE = new CommandType("scout.place");
    public static readonly CITY_CREATE = new CommandType("settlement.create");
    public static readonly CITY_UPGRADE = new CommandType("settlement.upgrade");

    readonly id: CommandTypeString;

    private constructor(id: CommandTypeString) {
        this.id = id;
    }

}
