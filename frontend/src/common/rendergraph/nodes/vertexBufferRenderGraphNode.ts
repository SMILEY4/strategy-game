import {RenderGraphNode} from "../renderGraphNode";
import {VertexCreatorRenderGraphNode} from "./vertexCreatorRenderGraphNode";

export class VertexBufferRenderGraphNode extends RenderGraphNode {

	public withInput(node: VertexCreatorRenderGraphNode.Output): VertexBufferRenderGraphNode {
		// todo
		return this;
	}

	validate(): string[] {
		const errors: string[] = [];
		return errors;
	}


}