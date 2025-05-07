import {RenderGraphNode} from "../renderGraphNode";

export class InitRenderGraphNode extends RenderGraphNode<InitRenderGraphNode> {

	public withInputs(nodes: RenderGraphNode<any>[]): InitRenderGraphNode {
		nodes.forEach(it => this.registerInput(it))
		return this;
	}

	validate(): string[] {
		return [];
	}

}