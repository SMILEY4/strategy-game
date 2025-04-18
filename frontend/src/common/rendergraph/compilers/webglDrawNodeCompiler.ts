import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {ShaderRenderGraphNode} from "../nodes/shaderRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {RenderTargetRenderGraphNode} from "../nodes/renderTargetRenderGraphNode";
import {DrawRenderGraphNode} from "../nodes/drawRenderGraphNode";

export class WebglDrawNodeCompiler implements RenderGraphNodeCompiler<DrawRenderGraphNode> {

	isInlineCompile(): boolean {
		return true;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof DrawRenderGraphNode;
	}

	compile(node: DrawRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		const commands: RenderGraphCommand[] = [];

		for (let input of node.getInputs()) {
			if (input instanceof ShaderRenderGraphNode) {
				commands.push(...context.compile(input));
			}
		}

		const outputsTo = this.findOutputsTo(node, context.getNodes());

		if (outputsTo && outputsTo instanceof RenderTargetRenderGraphNode) {
			commands.push(new RenderGraphCommand.BindFramebuffer(outputsTo));
		}

		commands.push(new RenderGraphCommand.DrawCall(node));

		if (outputsTo && outputsTo instanceof RenderTargetRenderGraphNode) {
			commands.push(new RenderGraphCommand.UnbindFramebuffer(outputsTo));
		}

		return commands;
	}

	private findOutputsTo(node: DrawRenderGraphNode, nodes: RenderGraphNode<any>[]): RenderGraphNode<any> | undefined {
		return nodes.find(other => other.getInputs().includes(node));
	}

}