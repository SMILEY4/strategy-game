import {RenderGraphNode} from "../renderGraphNode";
import {IntermediateRenderGraphCommand} from "../intermediateRenderGraphCommand";
import {ShaderRenderGraphNode} from "./shaderRenderGraphNode";

/**
 * Node to define a html canvas as a render target
 *
 * Inputs:
 * - ShaderRenderGraphNode: shader(s) that draw to this target
 */
export class CanvasRenderGraphNode extends RenderGraphNode<CanvasRenderGraphNode> {

	private readonly inputs: ShaderRenderGraphNode[] = [];

	public withInput(input: ShaderRenderGraphNode): CanvasRenderGraphNode {
		this.inputs.push(input);
		return this;
	}

	getInputs(): RenderGraphNode<any>[] {
		return this.inputs;
	}

	validate(): string[] {
		return [];
	}

	preCompile(): IntermediateRenderGraphCommand[] {
		const commands: IntermediateRenderGraphCommand[] = [];
		for (const input of this.inputs) {
			commands.push(...input.preCompile());
		}
		return commands;
	}

}