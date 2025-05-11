import {ProgrammableRenderGraphNode} from "./programmableRenderGraphNode";
import CreationFuncResult = VertexCreatorRenderGraphNode.VertexCreationFuncResult;
import {GLAttributeComponentAmount, GLAttributeType} from "../../webgl/glTypes";

/**
 * A node creating the data to render to a canvas using shaders.
 */
export class VertexCreatorRenderGraphNode extends ProgrammableRenderGraphNode<CreationFuncResult, VertexCreatorRenderGraphNode> {

	private readonly outputs = new Map<string, VertexCreatorRenderGraphNode.Output>();

	/**
	 * Define a named output. Any number of separate outputs can be defined. Outputs can be used as inputs for other nodes.
	 * @param name the name of the output (must be unique for this node)
	 * @param type whether this output describes vertex or instance data
	 * @param attributes the layout specification of the resulting data
	 */
	public withOutput(name: string, type: "vertices" | "instances", attributes: VertexAttribute[]): VertexCreatorRenderGraphNode {
		this.outputs.set(name, new VertexCreatorRenderGraphNode.Output(name, this, attributes, type));
		return this;
	}

	/**
	 * @return the output definition of this creator with the given name to use as inputs for other nodes.
	 */
	public useOutput(name: string): VertexCreatorRenderGraphNode.Output {
		return this.outputs.get(name)!;
	}

	/**
	 * @return the list of defined outputs.
	 */
	public getOutputs(): VertexCreatorRenderGraphNode.Output[] {
		return Array.from(this.outputs.values());
	}

	validate(): string[] {
		return [];
	}

}


export namespace VertexCreatorRenderGraphNode {

	/**
	 * The output type of the creation function
	 */
	export type VertexCreationFuncResult = Map<string, { data: ArrayBuffer, entryCount: number }>

	/**
	 * The definition of a named output.
	 */
	export class Output {
		constructor(
			public readonly name: string,
			public readonly creator: VertexCreatorRenderGraphNode,
			public readonly attributes: VertexAttribute[],
			public readonly type: "vertices" | "instances") {
		}
	}
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