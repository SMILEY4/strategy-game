import {TilePosition} from "../../../models/tile/tilePosition";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphNodeContext} from "../renderGraphNodeContext";
import {UID} from "../../uid";
import {PropertyRenderGraphNodeUtils, RenderGraphProperty} from "./propertyRenderGraphNode";
import ElementCreationFuncResult = ElementCreatorRenderGraphNode.ElementCreationFuncResult;

/**
 * A node creating the data to render html elements to a container.
 */
export class ElementCreatorRenderGraphNode implements RenderGraphNode {

	private readonly outputs = new Map<string, ElementCreatorRenderGraphNode.Output>();
	private readonly properties: ({ property: RenderGraphProperty<any>, name: string })[] = [];
	private func: (context: RenderGraphNodeContext) => ElementCreationFuncResult = () => undefined as any;
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
	public withProperty(property: RenderGraphProperty<any>, name: string): ElementCreatorRenderGraphNode {
		this.properties.push({
			property: property,
			name: name,
		});
		return this;
	}

	/**
	 * Set the creation function.
	 */
	public withFunction(func: (context: RenderGraphNodeContext) => ElementCreationFuncResult): ElementCreatorRenderGraphNode {
		this.func = func;
		return this;
	}

	/**
	 * Define a named output. Any number of separate outputs can be defined. Outputs can be used as inputs for other nodes.
	 * @param name the name of the output (must be unique for this node)
	 */
	public withOutput(name: string): ElementCreatorRenderGraphNode {
		this.outputs.set(name, new ElementCreatorRenderGraphNode.Output(name, this));
		return this;
	}

	/**
	 * @return the output definition of this creator with the given name to use as inputs for other nodes.
	 */
	public useOutput(name: string): ElementCreatorRenderGraphNode.Output {
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
	public getFunc(): (context: RenderGraphNodeContext) => ElementCreationFuncResult {
		return this.func;
	}

	/**
	 * @return the list of defined outputs.
	 */
	public getOutputs(): ElementCreatorRenderGraphNode.Output[] {
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
		)
	}

}


export namespace ElementCreatorRenderGraphNode {

	/**
	 * @return whether the given node is of type ElementCreatorRenderGraphNode
	 */
	export function isType(node: RenderGraphNode): node is ElementCreatorRenderGraphNode {
		return node instanceof ElementCreatorRenderGraphNode;
	}

	/**
	 * The output type of the creation function
	 */
	export type ElementCreationFuncResult = Map<string, Element[]>

	/**
	 * The base type for the result elements
	 */
	export interface Element {
		position: TilePosition,
	}

	/**
	 * The definition of a named output.
	 */
	export class Output {
		constructor(
			public readonly name: string,
			public readonly creator: ElementCreatorRenderGraphNode) {
		}
	}

}
