import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderTargetRenderGraphNode} from "../nodes/renderTargetRenderGraphNode";
import {DrawRenderGraphNode} from "../nodes/drawRenderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";
import {RenderGraphCommand} from "../renderGraphCommand";
import {BindVertexArrayRenderGraphCommand} from "../commands/bindVertexArrayRenderGraphCommand";
import {BindFramebufferRenderGraphCommand} from "../commands/bindFramebufferRenderGraphCommand";
import {DrawCallRenderGraphCommand} from "../commands/drawCallRenderGraphCommand";
import {UnbindFramebufferRenderGraphCommand} from "../commands/unbindFramebufferRenderGraphCommand";
import {SetupViewportRenderGraphCommand} from "../commands/setupViewportRenderGraphCommand";
import {SetupClearColorRenderGraphCommand} from "../commands/setupClearColorRenderGraphCommand";
import {SetupDepthTestRenderGraphCommand} from "../commands/setupDepthTestRenderGraphCommand";
import {SetupColorBlendRenderGraphCommand} from "../commands/setupColorBlendRenderGraphCommand";

export class WebglDrawNodeCompiler implements RenderGraphNodeCompiler<DrawRenderGraphNode> {

	isInlineCompile(): boolean {
		return true;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof DrawRenderGraphNode;
	}

	compile(node: DrawRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		const commands: RenderGraphCommand[] = [];

		// compile shader and add commands
		const shaderNode = node.getShaderNode();
		commands.push(...context.compile(shaderNode));

		// bind vertex array
		const vertexDescriptorNode = node.getVertexDescriptorNode();
		commands.push(new BindVertexArrayRenderGraphCommand(RenderGraphKeys.vertexArray(vertexDescriptorNode, shaderNode)));

		// bind framebuffer
		// todo: handle multiple output targets = multiple draw calls with different active framebuffers (or none)
		const outputsToRenderTarget = this.hasRenderTargetOutput(node, context.getNodes());
		if (outputsToRenderTarget) {
			const renderTarget = this.getRenderTargetOutput(node, context.getNodes());
			commands.push(new BindFramebufferRenderGraphCommand(renderTarget.getName(), node.getScaling()));
		}

		// setup viewport
		commands.push(new SetupViewportRenderGraphCommand(
			node.getScaling()
		));

		// setup clear color
		commands.push(new SetupClearColorRenderGraphCommand(
			node.getClearColor(),
		));

		// setup depth test
		commands.push(new SetupDepthTestRenderGraphCommand(
			this.getRenderTargetOutput(node, context.getNodes()).getEnableDepth(),
		));

		// setup color blending
		commands.push(new SetupColorBlendRenderGraphCommand(
			node.getBlendFunction(),
			outputsToRenderTarget,
		));

		// draw call
		commands.push(new DrawCallRenderGraphCommand(
			vertexDescriptorNode.getVertexCreatorOutputs().map(it => RenderGraphKeys.vertexInfo(it)),
		));

		// unbind framebuffer
		if (outputsToRenderTarget) {
			const renderTarget = this.getRenderTargetOutput(node, context.getNodes());
			commands.push(new UnbindFramebufferRenderGraphCommand(renderTarget.getName()));
		}

		return commands;
	}

	private hasRenderTargetOutput(node: DrawRenderGraphNode, nodes: RenderGraphNode<any>[]): boolean {
		const outputsTo = nodes.find(other => other.getInputs().includes(node));
		return outputsTo !== undefined && outputsTo instanceof RenderTargetRenderGraphNode;
	}

	private getRenderTargetOutput(node: DrawRenderGraphNode, nodes: RenderGraphNode<any>[]): RenderTargetRenderGraphNode {
		const outputsTo = nodes.find(other => other.getInputs().includes(node))!;
		return outputsTo as RenderTargetRenderGraphNode;
	}

}