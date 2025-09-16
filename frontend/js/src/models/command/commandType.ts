export class CommandType {

	public static readonly WORLD_OBJECT_MOVE = new CommandType("world-object-move")
	public static readonly WORLD_OBJECT_DISBAND = new CommandType("world-object-disband")


	readonly id: string;

	private constructor(id: string) {
		this.id = id;
	}
}