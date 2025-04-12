import {RenderGraphNode} from "../renderGraphNode";

export class VertexCreatorRenderGraphNode extends RenderGraphNode {

	private readonly outputs = new Map<string, VertexCreatorRenderGraphNode.Output>();

	validate(): string[] {
		return [];
	}

	public createOutput(name: string): VertexCreatorRenderGraphNode.Output {
		if(!this.outputs.has(name)) {
			this.outputs.set(name, new VertexCreatorRenderGraphNode.Output());
		}
		return this.outputs.get(name)!;
	}

}


export namespace VertexCreatorRenderGraphNode {

	export class Output {
		// todo
	}

}
