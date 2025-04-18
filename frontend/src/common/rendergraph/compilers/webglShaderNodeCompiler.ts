import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {ShaderRenderGraphNode} from "../nodes/shaderRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {RenderTargetRenderGraphNode} from "../nodes/renderTargetRenderGraphNode";
import {VertexDescriptorRenderGraphNode} from "../nodes/vertexDescriptorRenderGraphNode";
import {TextureRenderGraphNode} from "../nodes/textureRenderGraphNode";

export class WebglShaderNodeCompiler implements RenderGraphNodeCompiler<ShaderRenderGraphNode> {

	isInlineCompile(): boolean {
		return false;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof ShaderRenderGraphNode;
	}

	compile(node: ShaderRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		const commands: RenderGraphCommand[] = [];

		for (const input of node.getInputs()) {
			if (input instanceof VertexDescriptorRenderGraphNode) {
				commands.push(new RenderGraphCommand.BindVertexArray(input));
			}
			if (input instanceof TextureRenderGraphNode) {
				commands.push(new RenderGraphCommand.BindTexture(input));
			}
			if (input instanceof RenderTargetRenderGraphNode) {
				commands.push(new RenderGraphCommand.BindFramebufferTexture(input));
			}
		}

		commands.push(new RenderGraphCommand.UseShader(node));

		commands.push(new RenderGraphCommand.SetUniforms(node));

		return commands;
	}

}