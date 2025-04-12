import {RenderGraphNode} from "../renderGraphNode";
import {VertexDescriptorRenderGraphNode} from "./vertexDescriptorRenderGraphNode";
import {TextureRenderGraphNode} from "./textureRenderGraphNode";
import {Simulate} from "react-dom/test-utils";
import input = Simulate.input;
import {IntermediateRenderGraphCommand} from "../intermediateRenderGraphCommand";

export class ShaderRenderGraphNode extends RenderGraphNode {

	private vertexSource: string | null = null;
	private fragmentSource: string | null = null;

	private readonly inputs: ({ node: TextureRenderGraphNode | VertexDescriptorRenderGraphNode, binding: string | undefined })[] = [];


	public withVertexShader(source: string): ShaderRenderGraphNode {
		this.vertexSource = source;
		return this;
	}

	public withFragmentShader(source: string): ShaderRenderGraphNode {
		this.fragmentSource = source;
		return this;
	}

	public withInput(input: TextureRenderGraphNode | VertexDescriptorRenderGraphNode, bindingName?: string): ShaderRenderGraphNode {
		this.inputs.push({node: input, binding: bindingName});
		return this;
	}

	getInputs(): RenderGraphNode[] {
		return []; // todo
	}

	validate(): string[] {
		const errors: string[] = [];
		if (!this.vertexSource) {
			errors.push("missing vertex shader source");
		}
		if (!this.fragmentSource) {
			errors.push("missing fragment shader source");
		}
		return errors;
	}

	preCompile(): IntermediateRenderGraphCommand[] {
		const commands: IntermediateRenderGraphCommand[] = [];

		for (const input of this.inputs) {
			commands.push(...input.node.preCompile());
		}

		commands.push(new IntermediateRenderGraphCommand.UseShader())

		commands.push(new IntermediateRenderGraphCommand.SetUniforms())

		commands.push(new IntermediateRenderGraphCommand.DrawCall())

		return commands;
	}




}