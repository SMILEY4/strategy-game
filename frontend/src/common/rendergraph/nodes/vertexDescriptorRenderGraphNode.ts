import {RenderGraphNode} from "../renderGraphNode";
import {VertexCreatorRenderGraphNode} from "./vertexCreatorRenderGraphNode";

/**
 * Describes a drawable mesh by combining one or multiple vertex creator outputs.
 */
export class VertexDescriptorRenderGraphNode extends RenderGraphNode<VertexDescriptorRenderGraphNode> {

	private vertexCreatorOutputs: VertexCreatorRenderGraphNode.Output[] = [];

	/**
	 * Add the given vertex creator output to this vertex descriptor.
	 */
	public withInput(source: VertexCreatorRenderGraphNode.Output): VertexDescriptorRenderGraphNode {
		this.vertexCreatorOutputs.push(source);
		this.registerInput(source.creator);
		return this;
	}

	/**
	 * @return the specified vertex creator outputs
	 */
	public getVertexCreatorOutputs(): VertexCreatorRenderGraphNode.Output[] {
		return this.vertexCreatorOutputs;
	}

	validate(): string[] {
		const errors: string[] = [];

		if (this.vertexCreatorOutputs.length === 0) {
			errors.push("At least one vertex creator output must be defined.");
		}

		return errors;
	}

}

export namespace VertexDescriptorRenderGraphNode {

	export function isType(node: RenderGraphNode<any>): node is VertexDescriptorRenderGraphNode {
		return node instanceof VertexDescriptorRenderGraphNode;
	}

}
