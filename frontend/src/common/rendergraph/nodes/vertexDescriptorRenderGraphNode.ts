import {RenderGraphNode} from "../renderGraphNode";
import {VertexCreatorRenderGraphNode} from "./vertexCreatorRenderGraphNode";
import {UID} from "../../uid";
import {PropertyRenderGraphNodeUtils} from "./propertyRenderGraphNode";

/**
 * Describes a drawable mesh by combining one or multiple vertex creator outputs.
 */
export class VertexDescriptorRenderGraphNode implements RenderGraphNode {

	private sources: VertexCreatorRenderGraphNode.Output[] = [];
	private name: string = UID.generate();

	/**
	 * Set the name of this node to a given custom name. Names must be unique in the render graph.
	 */
	public withName(name: string): RenderGraphNode {
		this.name = name
		return this;
	}

	/**
	 * Add the given vertex creator output to this vertex descriptor.
	 */
	public withInput(source: VertexCreatorRenderGraphNode.Output): VertexDescriptorRenderGraphNode {
		this.sources.push(source);
		return this;
	}

	/**
	 * @return the specified vertex creator outputs
	 */
	public getVertexCreatorOutputs(): VertexCreatorRenderGraphNode.Output[] {
		return this.sources;
	}


	getName(): string {
		return this.name;
	}

	getInputs(): RenderGraphNode[] {
		return this.sources
			.map(it => it.creator)
			.distinct();
	}

	getChangeTest(): () => boolean {
		return PropertyRenderGraphNodeUtils.mergeChangeTests(
			this.sources
				.map(it => it.creator)
				.distinct()
				.map(it => it.getChangeTest())
		)
	}

	validate(): string[] {
		const errors: string[] = [];

		if (this.sources.length === 0) {
			errors.push("At least one vertex creator output must be defined.");
		}

		return errors;
	}

}

export namespace VertexDescriptorRenderGraphNode {

	export function isType(node: RenderGraphNode): node is VertexDescriptorRenderGraphNode {
		return node instanceof VertexDescriptorRenderGraphNode;
	}

}
