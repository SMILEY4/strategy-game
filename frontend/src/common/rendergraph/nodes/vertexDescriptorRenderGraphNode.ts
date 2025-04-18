import {RenderGraphNode} from "../renderGraphNode";
import {VertexBufferRenderGraphNode} from "./vertexBufferRenderGraphNode";

export class VertexDescriptorRenderGraphNode extends RenderGraphNode<VertexDescriptorRenderGraphNode> {

	private buffers: VertexBufferRenderGraphNode[] = [];

	public withInput(input: VertexBufferRenderGraphNode): VertexDescriptorRenderGraphNode {
		this.buffers.push(input);
		return this;
	}

	getInputs(): RenderGraphNode<any>[] {
		return this.buffers;
	}

}