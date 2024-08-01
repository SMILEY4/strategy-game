export class WorldObjectType {

	public static readonly SCOUT = new WorldObjectType("scout", "/icons/worldobjects/unit_scout.png");

	readonly id: string;
	readonly icon: string;

	private constructor(id: string, icon: string) {
		this.id = id;
		this.icon = icon;
	}

}