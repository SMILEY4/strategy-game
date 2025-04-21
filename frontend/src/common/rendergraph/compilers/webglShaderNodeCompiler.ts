import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {ShaderRenderGraphNode} from "../nodes/shaderRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderTargetRenderGraphNode} from "../nodes/renderTargetRenderGraphNode";
import {TextureRenderGraphNode} from "../nodes/textureRenderGraphNode";
import {TextureUnitHandler} from "../resources/textureUnitHandler";
import {RenderGraphKeys} from "../renderGraphKeys";
import {RenderGraphCommand} from "../renderGraphCommand";
import {BindTextureRenderGraphCommand} from "../commands/bindTextureRenderGraphCommand";
import {BindFramebufferTextureRenderGraphCommand} from "../commands/bindFramebufferTextureRenderGraphCommand";
import {UseShaderRenderGraphCommand} from "../commands/useShaderRenderGraphCommand";

export class WebglShaderNodeCompiler implements RenderGraphNodeCompiler<ShaderRenderGraphNode> {

	isInlineCompile(): boolean {
		return false;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof ShaderRenderGraphNode;
	}

	compile(node: ShaderRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		const commands: RenderGraphCommand[] = [];

		const textureUnitHandler = context.getAdditional<TextureUnitHandler>(RenderGraphKeys.textureUnitHandler());

		const usedTextures = node
			.getInputs()
			.filter(it => it instanceof TextureRenderGraphNode || it instanceof RenderTargetRenderGraphNode)
			.map(it => {
				if (it instanceof TextureRenderGraphNode) return RenderGraphKeys.texture(it);
				if (it instanceof RenderTargetRenderGraphNode) return RenderGraphKeys.framebuffer(it);
				throw new Error("unhandled type");
			});

		for (const input of node.getInputs()) {

			if (input instanceof TextureRenderGraphNode) {
				const imageUrl = (input as TextureRenderGraphNode).getImageUrl();
				const textureUnit = textureUnitHandler.findTextureUnit(imageUrl, usedTextures);
				commands.push(new BindTextureRenderGraphCommand(imageUrl, textureUnit));
			}

			if (input instanceof RenderTargetRenderGraphNode) {
				const framebufferName = RenderGraphKeys.framebuffer((input as RenderTargetRenderGraphNode));
				const textureUnit = textureUnitHandler.findTextureUnit(framebufferName, usedTextures);
				commands.push(new BindFramebufferTextureRenderGraphCommand(framebufferName, textureUnit));
			}

		}

		commands.push(new UseShaderRenderGraphCommand(RenderGraphKeys.shaderProgram(node)));

		return commands;
	}

}