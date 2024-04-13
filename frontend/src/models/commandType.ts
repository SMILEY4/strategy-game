export type CommandTypeString =
    "production-queue-entry.add"
    | "production-queue-entry.cancel"
    | "scout.place"
    | "settlement.create"
    | "settlement.upgrade"
    | "marker.place"
    | "marker.delete";

export class CommandType {

    public static readonly PRODUCTION_QUEUE_ADD = new CommandType("production-queue-entry.add");
    public static readonly PRODUCTION_QUEUE_CANCEL = new CommandType("production-queue-entry.cancel");
    public static readonly SCOUT_PLACE = new CommandType("scout.place");
    public static readonly CITY_CREATE = new CommandType("settlement.create");
    public static readonly CITY_UPGRADE = new CommandType("settlement.upgrade");
    public static readonly MARKER_PLACE = new CommandType("marker.place");
    public static readonly MARKER_DELETE = new CommandType("marker.delete");

    readonly id: CommandTypeString;

    private constructor(id: CommandTypeString) {
        this.id = id;
    }

}
