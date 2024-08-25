export class Visibility {

	public static readonly VISIBLE = new Visibility("VISIBLE", 0);
	public static readonly DISCOVERED = new Visibility("DISCOVERED", 1);
	public static readonly UNKNOWN = new Visibility("UNKNOWN", 2);

	public static fromString(id: string): Visibility {
		if(id === Visibility.VISIBLE.id) return Visibility.VISIBLE
		if(id === Visibility.DISCOVERED.id) return Visibility.DISCOVERED
		if(id === Visibility.UNKNOWN.id) return Visibility.UNKNOWN
		throw new Error("Unknown Visibility ID: " + id)
	}

	readonly id: string;
	readonly renderId: number

	private constructor(id: string, renderId: number) {
		this.id = id;
		this.renderId = renderId;
	}

}