import {RenderGraphNode} from "../renderGraphNode";
import {DrawRenderGraphNode} from "./drawRenderGraphNode";

/**
 * Node to define a html canvas as a render target
 *
 * Inputs:
 * - ShaderRenderGraphNode: shader(s) that draw to this target
 */
export class CanvasRenderGraphNode extends RenderGraphNode<CanvasRenderGraphNode> {

	private readonly inputs: DrawRenderGraphNode[] = [];

	public withInput(input: DrawRenderGraphNode): CanvasRenderGraphNode {
		this.inputs.push(input);
		return this;
	}

	getInputs(): RenderGraphNode<any>[] {
		return this.inputs;
	}

}