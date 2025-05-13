import {GLAttributeComponentAmount, GLAttributeType} from "../../webgl/glTypes";
import {RenderGraphNodeContext} from "../renderGraphNodeContext";
import {RenderGraphNode} from "../renderGraphNode";
import {UID} from "../../uid";
import {PropertyRenderGraphNodeUtils, RenderGraphProperty} from "./propertyRenderGraphNode";
import {DataGeneratorOutputDefinition, DataGeneratorRenderGraphNode} from "./dataGeneratorRenderGraphNode";

/**
 * A node creating the data to render to a canvas using shaders.
 */
export class VertexGeneratorRenderGraphNode implements RenderGraphNode, DataGeneratorRenderGraphNode<VertexGeneratorOutputDefinition, VertexGeneratorResult> {

	private readonly outputs = new Map<string, VertexGeneratorOutputDefinition>();
	private readonly properties: ({ property: RenderGraphProperty<any>, name: string })[] = [];
	private func: (context: RenderGraphNodeContext) => Map<string, VertexGeneratorResult> = () => undefined as any;
	private name: string = UID.generate();

	/**
	 * Set the name of this node to a given custom name. Names must be unique in the render graph.
	 */
	public withName(name: string): RenderGraphNode {
		this.name = name
		return this;
	}

	/**
	 * Make the given property available in the creation function via the given name.
	 */
	public withProperty(property: RenderGraphProperty<any>, name: string): VertexGeneratorRenderGraphNode {
		this.properties.push({
			property: property,
			name: name,
		});
		return this;
	}

	/**
	 * Set the creation function.
	 */
	public withFunction(func: (context: RenderGraphNodeContext) => Map<string, VertexGeneratorResult>): VertexGeneratorRenderGraphNode {
		this.func = func;
		return this;
	}

	/**
	 * Define a named output. Any number of separate outputs can be defined. Outputs can be used as inputs for other nodes.
	 * @param name the name of the output (must be unique for this node)
	 * @param type whether this output describes vertex or instance data
	 * @param attributes the layout specification of the resulting data
	 */
	public withOutput(name: string, type: "vertices" | "instances", attributes: VertexAttribute[]): VertexGeneratorRenderGraphNode {
		this.outputs.set(name, {
			name: name,
			generator: this,
			type: type,
			attributes: attributes,
		});
		return this;
	}

	/**
	 * @return the output definition of this creator with the given name to use as inputs for other nodes.
	 */
	public useOutput(name: string): VertexGeneratorOutputDefinition {
		return this.outputs.get(name)!;
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
	public getGeneratorFunction(): (context: RenderGraphNodeContext) => Map<string, VertexGeneratorResult> {
		return this.func;
	}


	/**
	 * @return the list of defined outputs.
	 */
	public getOutputDefinitions(): VertexGeneratorOutputDefinition[] {
		return Array.from(this.outputs.values());
	}


	getInputs(): RenderGraphNode[] {
		return this.properties.map(it => it.property);
	}

	getName(): string {
		return this.name;
	}

	getChangeTest(): () => boolean {
		return PropertyRenderGraphNodeUtils.mergeChangeTests(
			this.properties.map(it => it.property.getChangeTest())
		)
	}

	validate(): string[] {
		return [];
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