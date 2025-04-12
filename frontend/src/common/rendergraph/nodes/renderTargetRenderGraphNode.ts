import {RenderGraphNode} from "../renderGraphNode";
import {IntermediateRenderGraphCommand} from "../intermediateRenderGraphCommand";
import {ShaderRenderGraphNode} from "./shaderRenderGraphNode";

export class CanvasRenderGraphNode extends RenderGraphNode {

	private readonly inputs: ShaderRenderGraphNode[] = [];

	public withInput(input: ShaderRenderGraphNode): CanvasRenderGraphNode {
		this.inputs.push(input);
		return this;
	}

	getInputs(): RenderGraphNode[] {
		return this.inputs;
	}

	validate(): string[] {
		return [];
	}

	preCompile(): IntermediateRenderGraphCommand[] {
		const commands: IntermediateRenderGraphCommand[] = [];

		commands.push(new IntermediateRenderGraphCommand.BindFramebuffer())

		for (const input of this.inputs) {
			commands.push(...input.preCompile());
		}

		commands.push(new IntermediateRenderGraphCommand.UnbindFramebuffer())

		return commands;
	}


}