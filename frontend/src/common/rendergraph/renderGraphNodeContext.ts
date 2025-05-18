import {RenderGraphResourceManager} from "./renderGraphResourceManager";

export class RenderGraphNodeContext {

	private readonly resourceManager: RenderGraphResourceManager;
	private readonly mapping: Map<string, string>;

	constructor(resourceManager: RenderGraphResourceManager, mapping: Map<string, string>) {
		this.resourceManager = resourceManager;
		this.mapping = mapping;
	}

	public get<T>(name: string): T {
		const key = this.mapping.get(name);
		if (key) {
			return this.resourceManager.getResource<T>(key) ;
		} else {
			throw new Error("The requested key (" + name + ") is not available in this context.");
		}
	}

	public getMapping(): Map<string, string> {
		return this.mapping;
	}

}