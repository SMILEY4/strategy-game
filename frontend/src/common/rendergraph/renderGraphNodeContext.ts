import {RenderGraphResourceManager} from "./renderGraphResourceManager";
import {GeneratedDataContainer} from "./resources/generatedDataContainer";

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
			const resource = this.resourceManager.getResource(key);
			if(resource instanceof GeneratedDataContainer) {
				return resource.data
			} else {
				return resource as T
			}
		} else {
			throw new Error("The requested key (" + name + ") is not available in this context.");
		}
	}

}