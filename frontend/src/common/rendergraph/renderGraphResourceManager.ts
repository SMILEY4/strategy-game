import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphResourceCreator} from "./renderGraphResourceCreator";

export class RenderGraphResourceManager {

	private readonly resourceCreator: RenderGraphResourceCreator<any>[];
	private readonly resourceDisposers = new Map<string, (resource: any) => void>();
	private readonly resources = new Map<string, any>();

	constructor(resourceCreator: RenderGraphResourceCreator<any>[]) {
		this.resourceCreator = resourceCreator;
	}

	public initialize(nodes: RenderGraphNode[]): void {
		for (let node of nodes) {
			this.resourceCreator
				.filter(it => it.appliesTo(node))
				.forEach(it => it.create(node, this));
		}
	}

	public createResource<T>(name: string, resource: T, dispose?: (resource: T) => void) {
		this.resources.set(name, resource);
		if(dispose != undefined) {
			this.resourceDisposers.set(name, dispose);
		}
	}

	public hasResource(name: string): boolean {
		return this.resources.has(name);
	}

	public getResource<T>(name: string): T {
		const resource = this.resources.get(name);
		if (!resource) {
			throw new Error("No resource with name " + name);
		}
		return resource;
	}

	public updateResource<T>(name: string, resource: T) {
		const disposeFunc = this.resourceDisposers.get(name);
		if (disposeFunc) {
			const resource = this.resources.get(name);
			if (resource) {
				disposeFunc(resource);
			}
		}
		if (this.resources.has(name)) {
			this.resources.set(name, resource);
		} else {
			throw new Error("No resource with name " + name);
		}
	}

	public dispose() {
		for (let [name, disposer] of this.resourceDisposers) {
			disposer(this.getResource(name));
		}
	}

}