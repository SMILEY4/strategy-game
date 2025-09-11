import {GLAttributeComponentAmount, GLAttributeType} from "../../webgl/glTypes";
import {AbstractDataGeneratorRenderGraphNode, DataGeneratorOutputDefinition} from "./dataGeneratorRenderGraphNode";

/**
 * A node creating the data to render to a canvas using shaders.
 */
export class VertexGeneratorRenderGraphNode extends AbstractDataGeneratorRenderGraphNode<VertexGeneratorRenderGraphNode, VertexGeneratorOutputDefinition, VertexGeneratorResult> {

	/**
	 * Define a named output. Any number of separate outputs can be defined. Outputs can be used as inputs for other nodes.
	 * @param name the name of the output (must be unique for this node)
	 * @param type whether this output describes vertex or instance data
	 * @param attributes the layout specification of the resulting data
	 */
	public withOutput(name: string, type: "vertices" | "instances", attributes: VertexAttribute[]): VertexGeneratorRenderGraphNode {
		this.defineOutput({
			name: name,
			generator: this,
			type: type,
			attributes: attributes,
		});
		return this;
	}

}

export interface VertexGeneratorOutputDefinition extends DataGeneratorOutputDefinition<VertexGeneratorRenderGraphNode> {
	attributes: VertexAttribute[],
	type: "vertices" | "instances"
}

export interface VertexGeneratorResult {
	data: ArrayBuffer,
	entryCount: number
}

/**
 * The configuration for a single vertex attribute
 */
export interface VertexAttribute {
	name: string,
	type: GLAttributeType,
	amountComponents: GLAttributeComponentAmount,
	normalized?: boolean,
	stride?: number,
	offset?: number,
	divisor?: number,
}