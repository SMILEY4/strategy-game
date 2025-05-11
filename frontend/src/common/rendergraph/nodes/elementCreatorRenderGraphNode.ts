import {ProgrammableRenderGraphNode} from "./programmableRenderGraphNode";
import {TilePosition} from "../../../models/tile/tilePosition";
import ElementCreationFuncResult = ElementCreatorRenderGraphNode.ElementCreationFuncResult;
import {RenderGraphNode} from "../renderGraphNode";

/**
 * A node creating the data to render html elements to a container.
 */
export class ElementCreatorRenderGraphNode extends ProgrammableRenderGraphNode<ElementCreationFuncResult, ElementCreatorRenderGraphNode> {

	private readonly outputs = new Map<string, ElementCreatorRenderGraphNode.Output>();

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
		if(this.outputs.has(name)) {
			return this.outputs.get(name)!
		} else {
			throw new Error("No output with name '" + name + "' defined.")
		}
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

}


export namespace ElementCreatorRenderGraphNode {

	/**
	 * @return whether the given node is of type ElementCreatorRenderGraphNode
	 */
	export function isType(node: RenderGraphNode<any>): node is ElementCreatorRenderGraphNode {
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
