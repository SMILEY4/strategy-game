import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {ShaderRenderGraphNode} from "../nodes/shaderRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {RenderTargetRenderGraphNode} from "../nodes/renderTargetRenderGraphNode";

export class WebglShaderNodeCompiler implements RenderGraphNodeCompiler<ShaderRenderGraphNode> {

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof ShaderRenderGraphNode;
	}

	compile(node: ShaderRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		const commands: RenderGraphCommand[] = [];

		const outputsTo = this.findOutputsTo(node, context.getNodes());

		for (const input of node.getInputs()) {
			// if (input.node instanceof VertexDescriptorRenderGraphNode) {
			// 	commands.push(new RenderGraphCommand.BindVertexArray(input.node));
			// }
			// if (input.node instanceof TextureRenderGraphNode) {
			// 	commands.push(new RenderGraphCommand.BindTexture(input.node));
			// }
			// if (input.node instanceof RenderTargetRenderGraphNode) {
			// 	commands.push(new RenderGraphCommand.BindFramebufferTexture(input.node));
			// }
		}

		commands.push(new RenderGraphCommand.UseShader(node));

		commands.push(new RenderGraphCommand.SetUniforms(node));

		if(outputsTo && outputsTo instanceof RenderTargetRenderGraphNode) {
			commands.push(new RenderGraphCommand.BindFramebuffer(outputsTo));
		}

		commands.push(new RenderGraphCommand.DrawCall(node));

		if(outputsTo && outputsTo instanceof RenderTargetRenderGraphNode) {
			commands.push(new RenderGraphCommand.UnbindFramebuffer(outputsTo));
		}

		return commands;
	}

	private findOutputsTo(node: ShaderRenderGraphNode, nodes: RenderGraphNode<any>[]): RenderGraphNode<any> | undefined {
		return nodes.find(other => other.getInputs().includes(node));
	}

}