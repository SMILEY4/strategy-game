import {UID} from "../uid";

/**
 * Abstract base class representing a node in a render graph.
 * This class provides a unique name for each node and defines the structure
 * for managing input nodes in derived classes.
 *
 * @template TNode - The type of the derived class, used for method chaining.
 */
export abstract class RenderGraphNode<TNode> {

	private name: string; // todo: separate unique name and debug name -> use unique for keys, etc -> still show mapping unique name to debug name
	private readonly inputs: RenderGraphNode<any>[] = [];


	/**
	 * Constructs a new `RenderGraphNode` instance and automatically assigns it a unique name.
	 */
	public constructor() {
		this.name = UID.generate();
	}

	/**
	 * Checks and validates the current configuration of this node.
	 * @returns the validation errors as strings or an empty array for a valid configuration.
	 */
	public abstract validate(): string[]

	/**
	 * Sets a custom name for the render graph node.
	 *
	 * @param name - The custom name to assign to the node.
	 * @returns this node for chaining.
	 */
	public withName(name: string): TNode {
		this.name = name;
		return this as unknown as TNode;
	}

	/**
	 * @returns The name of the node.
	 */
	public getName(): string {
		return this.name;
	}

	/**
	 * Registers the given node as an input for this render graph node.
	 */
	protected registerInput(input: RenderGraphNode<any>): void {
		this.inputs.push(input);
	}

	/**
	 * @returns the input nodes for this render graph node.
	 */
	public getInputs(): RenderGraphNode<any>[] {
		return this.inputs.distinct();
	}
}