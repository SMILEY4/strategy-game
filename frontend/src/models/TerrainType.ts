export class TerrainType {

	public static readonly LAND = new TerrainType("LAND")
	public static readonly WATER = new TerrainType("WATER")

	public static fromString(id: string): TerrainType {
		if(id === TerrainType.LAND.id) return TerrainType.LAND
		if(id === TerrainType.WATER.id) return TerrainType.WATER
		throw new Error("Unknown TerrainType ID: " + id)
	}

	readonly id: string

	private constructor(id: string) {
		this.id = id;
	}
}