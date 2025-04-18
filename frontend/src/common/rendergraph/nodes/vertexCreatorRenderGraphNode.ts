import {RenderGraphNode} from "../renderGraphNode";
import {IntermediateRenderGraphCommand} from "../intermediateRenderGraphCommand";

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

	validate(): string[] {
		const errors: string[] = [];  // todo
		return errors;
	}

	preCompile(): IntermediateRenderGraphCommand[] {
		return [
			new IntermediateRenderGraphCommand.UpdateVertexData(this)
		]
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