export class WorldObjectType {

	public static readonly SCOUT = new WorldObjectType("scout", "/icons/worldobjects/unit_scout.png");
	public static readonly SETTLER = new WorldObjectType("settler", "/icons/worldobjects/unit_settler.png");

	readonly id: string;
	readonly icon: string;

	private constructor(id: string, icon: string) {
		this.id = id;
		this.icon = icon;
	}

}