import {RenderGraphNode} from "../renderGraphNode";
import {VertexBufferRenderGraphNode} from "./vertexBufferRenderGraphNode";

export class VertexDescriptorRenderGraphNode extends RenderGraphNode {

	private buffers: VertexBufferRenderGraphNode[] = [];

	public withInput(input: VertexBufferRenderGraphNode): VertexDescriptorRenderGraphNode {
		this.buffers.push(input);
		return this;
	}


	validate(): string[] {
		const errors: string[] = [];
		return errors;
	}


}