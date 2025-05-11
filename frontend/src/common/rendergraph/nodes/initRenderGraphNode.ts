import {RenderGraphNode} from "../renderGraphNode";

/**
 * Node depending on all nodes. No node depends on this node. Created and managed automatically by render graph.
 */
export class InitRenderGraphNode extends RenderGraphNode<InitRenderGraphNode> {

	/**
	 * Add the given nodes as dependencies
	 */
	public withInputs(nodes: RenderGraphNode<any>[]): InitRenderGraphNode {
		nodes.forEach(it => this.registerInput(it));
		return this;
	}

	validate(): string[] {
		return [];
	}

}