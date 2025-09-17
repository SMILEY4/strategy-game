import {Color} from "../../common/color/color";

export class TileResourceType {

	// predefined instances
	public static readonly NONE = new TileResourceType("NONE", null);
	public static readonly WOOD = new TileResourceType("WOOD", Color.rgbByte(112, 87, 28));
	public static readonly FISH = new TileResourceType("FISH", Color.rgbByte(36, 133, 212));
	public static readonly STONE = new TileResourceType("STONE", Color.rgbByte(80, 86, 92));
	public static readonly METAL = new TileResourceType("METAL", Color.rgbByte(134, 156, 158));

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