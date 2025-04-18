import {IntermediateRenderGraphCommand} from "./intermediateRenderGraphCommand";

/**
 * Single generic node in the graph.
 */
export abstract class RenderGraphNode<T> {

	private readonly tags: string[] = [];
	public withTag(tag: string): T {
		this.tags.push(tag);
		return this as unknown as T
	}
	public getTags(): string[] {
		return this.tags;
	}

	public abstract getInputs(): RenderGraphNode<any>[]
	public abstract validate(): string[]
	public abstract preCompile(): IntermediateRenderGraphCommand[]
}