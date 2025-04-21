import {UID} from "../uid";

/**
 * Single generic node in the graph.
 */
export abstract class RenderGraphNode<T> {

	private name: string;

	public constructor() {
		this.name = UID.generate();
	}

	public withName(name: string): T {
		this.name = name;
		return this as unknown as T;
	}

	public getName(): string {
		return this.name;
	}

	public abstract getInputs(): RenderGraphNode<any>[]
}