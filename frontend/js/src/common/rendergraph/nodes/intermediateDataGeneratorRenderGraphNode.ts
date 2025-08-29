import {AbstractDataGeneratorRenderGraphNode, DataGeneratorOutputDefinition} from "./dataGeneratorRenderGraphNode";

/**
 * A node creating data that can be used as inputs/properties for other nodes
 */
export class IntermediateDataGeneratorRenderGraphNode extends AbstractDataGeneratorRenderGraphNode<IntermediateDataGeneratorRenderGraphNode, IntermediateDataGeneratorOutputDefinition, any> {

	/**
	 * Define a named output. Any number of separate outputs can be defined. Outputs can be used as inputs for other nodes.
	 * @param name the name of the output (must be unique for this node)
	 */
	public withOutput(name: string): IntermediateDataGeneratorRenderGraphNode {
		this.defineOutput({
			name: name,
			generator: this,
		});
		return this;
	}

}

export interface IntermediateDataGeneratorOutputDefinition extends DataGeneratorOutputDefinition<IntermediateDataGeneratorRenderGraphNode> {
}
