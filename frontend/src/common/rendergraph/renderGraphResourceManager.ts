import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphResourceCreator} from "./renderGraphResourceCreator";

export class RenderGraphResourceManager {

	private resourcesInitialized = false;
	private readonly resourceCreator: RenderGraphResourceCreator<any>[];
	private readonly resources = new Map<string, ManagedResource<any>>();

	constructor(
		private readonly frameIdResourceName: string,
		resourceCreator: RenderGraphResourceCreator<any>[],
	) {
		this.resourceCreator = resourceCreator;
	}

	public initialize(nodes: RenderGraphNode[]): void {
		for (let node of nodes) {
			this.resourceCreator
				.filter(it => it.appliesTo(node))
				.forEach(it => it.create(node, this));
		}
		this.resourcesInitialized = true;
	}

	public createResource<T>(name: string, resource: T, dispose?: (resource: T) => void) {
		if (this.resourcesInitialized) {
			throw new Error("All resources have been initialized. No new resources can be created.");
		}
		this.resources.set(name, {
			name: name,
			resource: resource,
			disposeFunc: dispose == undefined ? null : dispose,
			lastUpdateFrameId: "init",
		});
	}

	public updateResource<T>(name: string, resource: T) {
		const managedResource = this.getManagedResource<T>(name);
		if (managedResource.disposeFunc != null) {
			managedResource.disposeFunc(managedResource.resource);
		}
		managedResource.lastUpdateFrameId = this.getCurrentFrameId();
		managedResource.resource = resource;
	}

	public dispose() {
		for (let managedResource of this.resources.values()) {
			if (managedResource.disposeFunc != null) {
				managedResource.disposeFunc(managedResource.resource);
			}
		}
	}

	public hasResource(name: string): boolean {
		return this.resources.has(name);
	}

	public getCurrentFrameId(): string {
		return this.getResource<string>(this.frameIdResourceName)
	}

	public getManagedResource<T>(name: string): ManagedResource<T> {
		const managedResource = this.resources.get(name);
		if (!managedResource) {
			throw new Error("No resource with name " + name);
		}
		return managedResource;
	}

	public getResource<T>(name: string): T {
		return this.getManagedResource<T>(name).resource;
	}

	public getResourceLastUpdateFrameId(name: string): string {
		return this.getManagedResource(name).lastUpdateFrameId
	}

}

export interface ManagedResource<T> {
	name: string,
	resource: T,
	disposeFunc: ((resource: T) => void) | null
	lastUpdateFrameId: string,
}