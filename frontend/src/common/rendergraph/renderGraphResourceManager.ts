import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphResourceCreator} from "./renderGraphResourceCreator";

export class RenderGraphResourceManager {

	private readonly resourceCreator: RenderGraphResourceCreator<any>[];

	constructor(resourceCreator: RenderGraphResourceCreator<any>[]) {
		this.resourceCreator = resourceCreator;
	}

	public initialize(nodes: RenderGraphNode<any>[]): void {
		for (let node of nodes) {
			this.resourceCreator
				.filter(it => it.appliesTo(node))
				.forEach(it => it.create(node, this));
		}
	}

	public setResource<T>(name: string, resource: T) {
		// todo
	}

	public hasResource(name: string): boolean {
		return false // todo
	}

	public getResource<T>(name: string): T {
		return null as T; // todo
	}

	private getResources(): Map<string, any> {
		return null as any; // todo
	}

}