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

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof DrawRenderGraphNode;
	}

	compile(node: DrawRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		const commands: RenderGraphCommand[] = [];

		// camera property
		const cameraPropertyName = RenderGraphKeys.property(node.getCameraProperty());

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
			commands.push(new BindFramebufferRenderGraphCommand(RenderGraphKeys.framebuffer(renderTarget), node.getScaling(), cameraPropertyName));
		}

		// setup viewport
		if (this.differentSetupViewportRenderGraphCommand(context, cameraPropertyName, node.getScaling())) {
			commands.push(new SetupViewportRenderGraphCommand(
				node.getScaling(),
				cameraPropertyName,
			));
		}

		// setup clear color
		if (this.differentSetupClearColorRenderGraphCommand(context, node.getClearColor())) {
			commands.push(new SetupClearColorRenderGraphCommand(
				node.getClearColor(),
			));
		}

		// setup depth test
		const shouldEnableDepthTest = this.hasRenderTargetOutput(node, context.getNodes())
				? this.getRenderTargetOutput(node, context.getNodes())?.getEnableDepth()
				: false;
		if(this.differentSetupDepthTestRenderGraphCommand(context, shouldEnableDepthTest)) {
			commands.push(new SetupDepthTestRenderGraphCommand(shouldEnableDepthTest));
		}

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
			commands.push(new UnbindFramebufferRenderGraphCommand(RenderGraphKeys.framebuffer(renderTarget)));
		}

		return commands;
	}

	private hasRenderTargetOutput(node: DrawRenderGraphNode, nodes: RenderGraphNode[]): boolean {
		const outputsTo = nodes.find(other => other.getInputs().includes(node));
		return outputsTo !== undefined && outputsTo instanceof RenderTargetRenderGraphNode;
	}

	private getRenderTargetOutput(node: DrawRenderGraphNode, nodes: RenderGraphNode[]): RenderTargetRenderGraphNode {
		const outputsTo = nodes.find(other => other.getInputs().includes(node))!;
		return outputsTo as RenderTargetRenderGraphNode;
	}

	private differentSetupViewportRenderGraphCommand(context: RenderGraphCompileContext, cameraPropName: string, scaling: number): boolean {
		const last = context
			.getCommands()
			.findLast(it => it instanceof SetupViewportRenderGraphCommand) as (SetupViewportRenderGraphCommand | undefined);
		if (last) {
			return last.cameraPropertyName !== cameraPropName || last.scaling !== scaling;
		} else {
			return true;
		}
	}

	private differentSetupClearColorRenderGraphCommand(context: RenderGraphCompileContext, clearColor: [number, number, number, number]): boolean {
		const last = context
			.getCommands()
			.findLast(it => it instanceof SetupClearColorRenderGraphCommand) as (SetupClearColorRenderGraphCommand | undefined);
		if (last) {
			return last.clearColor[0] !== clearColor[0]
				|| last.clearColor[1] !== clearColor[1]
				|| last.clearColor[2] !== clearColor[2]
				|| last.clearColor[3] !== clearColor[3];
		} else {
			return true;
		}
	}

	private differentSetupDepthTestRenderGraphCommand(context: RenderGraphCompileContext, enableDepthTest: boolean): boolean {
		const last = context
			.getCommands()
			.findLast(it => it instanceof SetupDepthTestRenderGraphCommand) as (SetupDepthTestRenderGraphCommand | undefined);
		if (last) {
			return last.enableDepth != enableDepthTest;
		} else {
			return true;
		}
	}

}