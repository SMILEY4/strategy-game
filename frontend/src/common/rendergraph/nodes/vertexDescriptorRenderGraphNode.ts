import {RenderGraphNode} from "../renderGraphNode";
import {UID} from "../../uid";
import {VertexGeneratorOutputDefinition} from "./vertexGeneratorRenderGraphNode";

/**
 * Describes a drawable mesh by combining one or multiple vertex creator outputs.
 */
export class VertexDescriptorRenderGraphNode implements RenderGraphNode {

	private sources: VertexGeneratorOutputDefinition[] = [];
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
	public withInput(source: VertexGeneratorOutputDefinition): VertexDescriptorRenderGraphNode {
		this.sources.push(source);
		return this;
	}

	/**
	 * @return the specified vertex creator outputs
	 */
	public getVertexCreatorOutputs(): VertexGeneratorOutputDefinition[] {
		return this.sources;
	}


	getName(): string {
		return this.name;
	}

	getInputs(): RenderGraphNode[] {
		return this.sources
			.map(it => it.generator)
			.distinct();
	}

	validate(): string[] {
		const errors: string[] = [];

		if (this.sources.length === 0) {
			errors.push("At least one vertex creator output must be defined.");
		}

		return errors;
	}

}
