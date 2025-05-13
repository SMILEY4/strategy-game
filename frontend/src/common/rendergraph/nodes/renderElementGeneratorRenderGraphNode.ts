import {TilePosition} from "../../../models/tile/tilePosition";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphNodeContext} from "../renderGraphNodeContext";
import {UID} from "../../uid";
import {PropertyRenderGraphNodeUtils, RenderGraphProperty} from "./propertyRenderGraphNode";
import {DataGeneratorOutputDefinition, DataGeneratorRenderGraphNode} from "./dataGeneratorRenderGraphNode";

/**
 * A node creating the data to render html elements to a container.
 */
export class RenderElementGeneratorRenderGraphNode implements RenderGraphNode, DataGeneratorRenderGraphNode<RenderElementGeneratorOutputDefinition, RenderElement[]> {

	private readonly outputs = new Map<string, RenderElementGeneratorOutputDefinition>();
	private readonly properties: ({ property: RenderGraphProperty<any>, name: string })[] = [];
	private func: (context: RenderGraphNodeContext) => Map<string, RenderElement[]> = () => undefined as any;
	private name: string = UID.generate();


	/**
	 * Set the name of this node to a given custom name. Names must be unique in the render graph.
	 */
	public withName(name: string): RenderGraphNode {
		this.name = name;
		return this;
	}

	/**
	 * Make the given property available in the creation function via the given name.
	 */
	public withProperty(property: RenderGraphProperty<any>, name: string): RenderElementGeneratorRenderGraphNode {
		this.properties.push({
			property: property,
			name: name,
		});
		return this;
	}

	/**
	 * Set the creation function.
	 */
	public withFunction(func: (context: RenderGraphNodeContext) => Map<string, RenderElement[]>): RenderElementGeneratorRenderGraphNode {
		this.func = func;
		return this;
	}

	/**
	 * Define a named output. Any number of separate outputs can be defined. Outputs can be used as inputs for other nodes.
	 * @param name the name of the output (must be unique for this node)
	 */
	public withOutput(name: string): RenderElementGeneratorRenderGraphNode {
		this.outputs.set(name, {
			name: name,
			generator: this,
		});
		return this;
	}

	/**
	 * @return the output definition of this creator with the given name to use as inputs for other nodes.
	 */
	useOutput(name: string): RenderElementGeneratorOutputDefinition {
		if (this.outputs.has(name)) {
			return this.outputs.get(name)!;
		} else {
			throw new Error("No output with name '" + name + "' defined.");
		}
	}


	/**
	 * @return the available properties.
	 */
	public getProperties(): RenderGraphProperty<any>[] {
		return this.properties.map(it => it.property);
	}

	/**
	 * @return the available properties with their names.
	 */
	public getPropertiesNamed(): ({ property: RenderGraphProperty<any>, name: string })[] {
		return this.properties;
	}

	/**
	 * @return the creation function
	 */
	getGeneratorFunction(): (context: RenderGraphNodeContext) => Map<string, RenderElement[]> {
		return this.func;
	}

	/**
	 * @return the list of defined outputs.
	 */
	getOutputDefinitions(): RenderElementGeneratorOutputDefinition[] {
		return Array.from(this.outputs.values());
	}

	validate(): string[] {
		return [];
	}

	getInputs(): RenderGraphNode[] {
		return [];
	}

	getName(): string {
		return this.name;
	}

	getChangeTest(): () => boolean {
		return PropertyRenderGraphNodeUtils.mergeChangeTests(
			this.properties.map(it => it.property.getChangeTest()),
		);
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
