import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphNodeContext} from "../renderGraphNodeContext";
import {RenderGraphProperty} from "./propertyRenderGraphNode";
import {UID} from "../../uid";

export interface DataGeneratorRenderGraphNode<TOutputDefinition extends DataGeneratorOutputDefinition<any>, TResult> extends RenderGraphNode {
	getGeneratorFunction(): (context: RenderGraphNodeContext) => Map<string, TResult>;
	getOutputDefinitions(): TOutputDefinition[];
	useOutput(name: string): TOutputDefinition;
}

export interface DataGeneratorOutputDefinition<TGenerator extends DataGeneratorRenderGraphNode<any, any>> {
	name: string,
	generator: TGenerator
}

export abstract class AbstractDataGeneratorRenderGraphNode<TNode extends RenderGraphNode, TOutputDefinition extends DataGeneratorOutputDefinition<any>, TResult> implements DataGeneratorRenderGraphNode<TOutputDefinition, TResult> {

	private readonly outputs = new Map<string, TOutputDefinition>();
	private readonly properties: ({ property: RenderGraphProperty<any>, name: string })[] = [];
	private func: (context: RenderGraphNodeContext) => Map<string, TResult> = () => undefined as any;
	private name: string = UID.generate();

	/**
	 * Set the name of this node to a given custom name. Names must be unique in the render graph.
	 */
	public withName(name: string): TNode {
		this.name = name;
		return this as unknown as TNode;
	}

	/**
	 * Make the given property available in the generator function via the given name.
	 */
	public withProperty(property: RenderGraphProperty<any>, name: string): TNode {
		this.properties.push({
			property: property,
			name: name,
		});
		return this as unknown as TNode;
	}

	/**
	 * Set the generation function.
	 */
	public withFunction(func: (context: RenderGraphNodeContext) => Map<string, TResult>): TNode {
		this.func = func;
		return this as unknown as TNode;
	}

	protected defineOutput(outputDefinition: TOutputDefinition): void {
		this.outputs.set(outputDefinition.name, outputDefinition);
	}

	useOutput(name: string): TOutputDefinition {
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

	getGeneratorFunction(): (context: RenderGraphNodeContext) => Map<string, TResult> {
		return this.func;
	}

	getInputs(): RenderGraphNode[] {
		return this.properties.map(it => it.property);
	}

	getName(): string {
		return this.name;
	}

	getOutputDefinitions(): TOutputDefinition[] {
		return Array.from(this.outputs.values());
	}

	validate(): string[] {
		return [];
	}

}