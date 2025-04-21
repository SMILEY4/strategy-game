import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {ShaderRenderGraphNode} from "../nodes/shaderRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderTargetRenderGraphNode} from "../nodes/renderTargetRenderGraphNode";
import {TextureRenderGraphNode} from "../nodes/textureRenderGraphNode";
import {TextureUnitHandler} from "./textureUnitHandler";
import {RenderGraphKeys} from "../renderGraphKeys";
import {RenderGraphCommand} from "../renderGraphCommand";
import {BindTextureRenderGraphCommand} from "../commands/bindTextureRenderGraphCommand";
import {BindFramebufferTextureRenderGraphCommand} from "../commands/bindFramebufferTextureRenderGraphCommand";
import {UseShaderRenderGraphCommand} from "../commands/useShaderRenderGraphCommand";
import {ProgramUniformEntry, SetUniformsRenderGraphCommand} from "../commands/setUniformsRenderGraphCommand";
import {PropertyRenderGraphNode} from "../nodes/propertyRenderGraphNode";
import {GLUniformType, GLUniformValueType} from "../../webgl/glTypes";
import {GLTexture} from "../../webgl/glTexture";
import {GLFramebuffer} from "../../webgl/glFramebuffer";

export class WebglShaderNodeCompiler implements RenderGraphNodeCompiler<ShaderRenderGraphNode> {

	isInlineCompile(): boolean {
		return false;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof ShaderRenderGraphNode;
	}

	compile(node: ShaderRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		const commands: RenderGraphCommand[] = [];

		// bind textures
		const textureUnitHandler = context.getCompileResource<TextureUnitHandler>(RenderGraphKeys.textureUnitHandler());

		const usedTextures = node
			.getInputs()
			.filter(it => it instanceof TextureRenderGraphNode || it instanceof RenderTargetRenderGraphNode)
			.map(it => {
				if (it instanceof TextureRenderGraphNode) return RenderGraphKeys.texture(it);
				if (it instanceof RenderTargetRenderGraphNode) return RenderGraphKeys.framebuffer(it);
				throw new Error("unhandled type");
			});

		for (const property of node.getProperties()) {

			if (property instanceof TextureRenderGraphNode) {
				const imageUrl = (property as TextureRenderGraphNode).getImageUrl();
				const textureUnit = textureUnitHandler.findTextureUnit(imageUrl, usedTextures);
				commands.push(new BindTextureRenderGraphCommand(imageUrl, textureUnit));
			}

			if (property instanceof RenderTargetRenderGraphNode) {
				const framebufferName = RenderGraphKeys.framebuffer((property as RenderTargetRenderGraphNode));
				const textureUnit = textureUnitHandler.findTextureUnit(framebufferName, usedTextures);
				commands.push(new BindFramebufferTextureRenderGraphCommand(framebufferName, textureUnit));
			}

		}

		// set uniforms
		const uniforms: ProgramUniformEntry[] = [];
		for (const namedProperty of node.getPropertiesNamed()) {
			const property = namedProperty.node;

			if (property instanceof TextureRenderGraphNode) {
				uniforms.push(new ProgramUniformEntry({
					valueProvider: resourceManager => resourceManager.getResource<GLTexture>(RenderGraphKeys.texture(property)),
					binding: namedProperty.binding,
					type: GLUniformType.SAMPLER_2D
				}));
			}

			if (property instanceof RenderTargetRenderGraphNode) {
				uniforms.push(new ProgramUniformEntry({
					valueProvider: resourceManager => resourceManager.getResource<GLFramebuffer>(RenderGraphKeys.framebuffer(property)),
					binding: namedProperty.binding,
					type: GLUniformType.SAMPLER_2D
				}));
			}

			if (property instanceof PropertyRenderGraphNode) {
				uniforms.push(new ProgramUniformEntry({
					valueProvider: () => (property.getProvider() as any as GLUniformValueType),
					binding: namedProperty.binding,
					type: property.getType()!
				}));
			}

		}

		commands.push(new SetUniformsRenderGraphCommand(uniforms, RenderGraphKeys.shaderProgram(node)));

		// use shader program
		commands.push(new UseShaderRenderGraphCommand(RenderGraphKeys.shaderProgram(node)));

		return commands;
	}

}