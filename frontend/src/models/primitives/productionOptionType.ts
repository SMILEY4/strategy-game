
export class ProductionOptionType {

	static readonly SETTLER = new ProductionOptionType("settler", "Settler", "")
	static readonly TOOL_WORKSHOP = new ProductionOptionType("tool_workshop", "Tool Workshop", "")

	public static fromId(id: string): ProductionOptionType {
		switch (id) {
			case ProductionOptionType.SETTLER.id: return ProductionOptionType.SETTLER
			case ProductionOptionType.TOOL_WORKSHOP.id: return ProductionOptionType.TOOL_WORKSHOP
			default: throw new Error("Unknown id for ProductionOptionType: " + id)
		}
	}

	readonly id: string;
	readonly name: string;
	readonly image: string;

	constructor(id: string, name: string, image: string) {
		this.id = id;
		this.name = name;
		this.image = image;
	}
}