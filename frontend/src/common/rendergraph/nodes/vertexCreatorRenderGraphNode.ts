import {RenderGraphNode} from "../renderGraphNode";

export class VertexCreatorRenderGraphNode extends RenderGraphNode<VertexCreatorRenderGraphNode> {

	private readonly outputs = new Map<string, VertexCreatorRenderGraphNode.Output>();

	public createOutput(name: string): VertexCreatorRenderGraphNode.Output {
		if (!this.outputs.has(name)) {
			this.outputs.set(name, new VertexCreatorRenderGraphNode.Output(this));
		}
		return this.outputs.get(name)!;
	}

	getInputs(): RenderGraphNode<any>[] {
		return [];
	}

}


export namespace VertexCreatorRenderGraphNode {

	export class Output {
		public readonly creator: VertexCreatorRenderGraphNode;

		constructor(creator: VertexCreatorRenderGraphNode) {
			this.creator = creator;
		}

		// todo
	}
}