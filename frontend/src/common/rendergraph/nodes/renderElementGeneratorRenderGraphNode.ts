import {TilePosition} from "../../../models/tile/tilePosition";
import {AbstractDataGeneratorRenderGraphNode, DataGeneratorOutputDefinition} from "./dataGeneratorRenderGraphNode";

/**
 * A node creating the data to render html elements to a container.
 */
export class RenderElementGeneratorRenderGraphNode extends AbstractDataGeneratorRenderGraphNode<RenderElementGeneratorRenderGraphNode, RenderElementGeneratorOutputDefinition, RenderElement[]> {

	/**
	 * Define a named output. Any number of separate outputs can be defined. Outputs can be used as inputs for other nodes.
	 * @param name the name of the output (must be unique for this node)
	 */
	public withOutput(name: string): RenderElementGeneratorRenderGraphNode {
		this.defineOutput({
			name: name,
			generator: this,
		});
		return this;
	}

}

/**
 * The base type for the result elements
 */
export interface RenderElement {
	position: TilePosition,
}

export interface RenderElementGeneratorOutputDefinition extends DataGeneratorOutputDefinition<RenderElementGeneratorRenderGraphNode> {
}
