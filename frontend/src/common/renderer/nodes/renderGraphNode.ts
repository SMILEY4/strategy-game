import {RenderGraphNodeInputDefinition} from "../inputoutput/renderGraphNodeInputDefinition";
import {RenderGraphNodeOutputDefinition} from "../inputoutput/renderGraphNodeOutputDefinition";
import {UID} from "../../uid";

/**
 * Single node in a render graph
 */
export abstract class RenderGraphNode {
	public readonly id: string;
	public readonly inputs: RenderGraphNodeInputDefinition[];
	public readonly outputs: RenderGraphNodeOutputDefinition[];

	protected constructor(inputs: RenderGraphNodeInputDefinition[], outputs: RenderGraphNodeOutputDefinition[]) {
		this.id = UID.generate();
		this.inputs = inputs;
		this.outputs = outputs;
	}
}