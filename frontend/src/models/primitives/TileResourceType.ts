import {Color} from "./color";

export class TileResourceType {

	public static readonly NONE = new TileResourceType("NONE", null);
	public static readonly WOOD = new TileResourceType("WOOD", {red: 112, green: 87, blue: 28});
	public static readonly FISH = new TileResourceType("FISH", {red: 36, green: 133, blue: 212});
	public static readonly STONE = new TileResourceType("STONE", {red: 80, green: 86, blue: 92});
	public static readonly METAL = new TileResourceType("METAL", {red: 134, green: 156, blue: 158});

	public static fromString(id: string): TileResourceType {
		if (id === TileResourceType.NONE.id) return TileResourceType.NONE;
		if (id === TileResourceType.WOOD.id) return TileResourceType.WOOD;
		if (id === TileResourceType.FISH.id) return TileResourceType.FISH;
		if (id === TileResourceType.STONE.id) return TileResourceType.STONE;
		if (id === TileResourceType.METAL.id) return TileResourceType.METAL;
		throw new Error("Unknown TileResourceType ID: " + id);
	}

	readonly id: string;
	readonly color: Color | null;

	private constructor(id: string, color: Color | null) {
		this.id = id;
		this.color = color;
	}

	public getIconPath(): string {
		return "/icons/resources/" + this.id + ".png"
	}
}