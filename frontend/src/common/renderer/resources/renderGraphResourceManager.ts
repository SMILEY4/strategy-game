import {RenderGraphResourceDefinition} from "./renderGraphResourceDefinition";
import {RenderGraphResource} from "./renderGraphResource";
import {ResourceKey} from "./resourceKey";

export class RenderGraphResourceManager {

	private readonly resourceDefinitions = new Map<ResourceKey, RenderGraphResourceDefinition<RenderGraphResource>>();
	private readonly resources = new Map<ResourceKey, RenderGraphResource>();
	private readonly changes = new Set<string>();

	//==== Resource Loading & Unloading =========

	public registerResource(resourceDefinition: RenderGraphResourceDefinition<RenderGraphResource>) {
		this.resourceDefinitions.set(resourceDefinition.key, resourceDefinition);
	}

	public registerResources(resourceDefinitions: RenderGraphResourceDefinition<RenderGraphResource>[]) {
		resourceDefinitions.forEach(resource => this.registerResource(resource))
	}

	private loadResource(key: ResourceKey) {
		const definition = this.resourceDefinitions.get(key);
		if (definition) {
			const resource = definition.load();
			this.resources.set(key, resource);
		} else {
			throw new Error("No resource with key '" + key + "' defined.");
		}
	}

	private isResourceLoaded(key: ResourceKey): boolean {
		return this.resources.has(key);
	}

	//==== Get & Set Loaded Resources ===========

	public requestResource<T extends RenderGraphResource>(key: ResourceKey): T {
		if (!this.isResourceLoaded(key)) {
			this.loadResource(key);
		}
		return this.resources.get(key) as T;
	}

	//==== Changes ==============================

	public clearChanges() {
		this.changes.clear();
	}

	public markChange(key: string) {
		this.changes.add(key);
	}

	public hasChange(keys: string[]): boolean {
		for (let i = 0; i < keys.length; i++) {
			if (this.changes.has(keys[i])) {
				return true;
			}
		}
		return false;
	}

	//==== Miscellaneous ========================

	public dispose() {
		this.resources.clear();
		this.changes.clear();
	}

}