export class Visibility {

	// predefined instances
	public static readonly VISIBLE = new Visibility("VISIBLE", 0);
	public static readonly DISCOVERED = new Visibility("DISCOVERED", 1);
	public static readonly UNKNOWN = new Visibility("UNKNOWN", 2);

	// collection of all values (dynamically built from static properties)
	public static readonly ALL: Visibility[] =
		Object
			.values(Visibility)
			.filter((v): v is Visibility => v instanceof Visibility);


	private constructor(
		public readonly id: string,
		public readonly renderId: number,
	) {
	}

}