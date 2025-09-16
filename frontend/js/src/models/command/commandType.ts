export class CommandType {

	public static readonly WORLD_OBJECT_MOVE = new CommandType("move")
	public static readonly WORLD_OBJECT_DISBAND = new CommandType("disband-world-object")


	readonly id: string;

	private constructor(id: string) {
		this.id = id;
	}
}