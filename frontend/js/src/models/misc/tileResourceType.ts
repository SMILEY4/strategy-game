import {Color} from "../../common/color";

export class TileResourceType {

	// predefined instances
	public static readonly NONE = new TileResourceType("NONE", null);
	public static readonly WOOD = new TileResourceType("WOOD", {red: 112, green: 87, blue: 28});
	public static readonly FISH = new TileResourceType("FISH", {red: 36, green: 133, blue: 212});
	public static readonly STONE = new TileResourceType("STONE", {red: 80, green: 86, blue: 92});
	public static readonly METAL = new TileResourceType("METAL", {red: 134, green: 156, blue: 158});

	// collection of all values (dynamically built from static properties)
	public static readonly ALL: TileResourceType[] =
		Object
			.values(TileResourceType)
			.filter((v): v is TileResourceType => v instanceof TileResourceType);

	// constructor with properties
	private constructor(
		public readonly id: string,
		public readonly color: Color | null,
	) {
	}

	public getIconPath(): string {
		return "/icons/resources/" + this.id + ".png";
	}
}