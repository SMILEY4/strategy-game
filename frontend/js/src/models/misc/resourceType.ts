import {Color} from "../../common/color/color";

export class ResourceType {

	// predefined instances
	public static readonly RAW_WOOD = new ResourceType("RAW_WOOD", Color.rgbByte(112, 87, 28));
	public static readonly RAW_FISH = new ResourceType("RAW_FISH", Color.rgbByte(36, 133, 212));
	public static readonly RAW_STONE = new ResourceType("RAW_STONE", Color.rgbByte(80, 86, 92));
	public static readonly RAW_METAL = new ResourceType("RAW_METAL", Color.rgbByte(134, 156, 158));
	public static readonly TIMBER = new ResourceType("TIMBER", Color.rgbByte(112, 87, 28));
	public static readonly FOOD = new ResourceType("FOOD", Color.rgbByte(36, 133, 212));
	public static readonly STONE = new ResourceType("STONE", Color.rgbByte(80, 86, 92));
	public static readonly METAL = new ResourceType("METAL", Color.rgbByte(134, 156, 158));


	// collection of all values (dynamically built from static properties)
	public static readonly ALL: ResourceType[] =
		Object
			.values(ResourceType)
			.filter((v): v is ResourceType => v instanceof ResourceType);

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