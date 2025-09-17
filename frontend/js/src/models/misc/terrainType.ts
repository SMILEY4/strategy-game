export class TerrainType {

	// predefined instances
	public static readonly LAND = new TerrainType("LAND", 1);
	public static readonly WATER = new TerrainType("WATER", 2);

	// collection of all values (dynamically built from static properties)
	public static readonly ALL: TerrainType[] =
		Object
			.values(TerrainType)
			.filter((v): v is TerrainType => v instanceof TerrainType);

	// constructor with properties
	private constructor(
		public readonly id: string,
		public readonly renderId: number,
	) {
	}
}