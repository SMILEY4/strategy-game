export class CommandType {

	public static readonly MOVE = new CommandType("move")
	public static readonly CREATE_SETTLEMENT = new CommandType("create-settlement")
	public static readonly PRODUCTION_QUEUE_ADD = new CommandType("production-queue.add")
	public static readonly PRODUCTION_QUEUE_CANCEL = new CommandType("production-queue.remove-entry")


	readonly id: string;

	private constructor(id: string) {
		this.id = id;
	}
}