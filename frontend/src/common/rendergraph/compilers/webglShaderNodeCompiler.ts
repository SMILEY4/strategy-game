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
import {ConstPropertyRenderGraphNode, RenderGraphProperty} from "../nodes/propertyRenderGraphNode";
import {ConditionalTextureRenderGraphNode} from "../nodes/conditionalTextureRenderGraphNode";
import {BindConditionalTextureRenderGraphCommand} from "../commands/bindConditionalTextureRenderGraphCommand";

export class WebglShaderNodeCompiler implements RenderGraphNodeCompiler<ShaderRenderGraphNode> {

	isInlineCompile(): boolean {
		return false;
	}

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof ShaderRenderGraphNode;
	}

	compile(node: ShaderRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		const commands: RenderGraphCommand[] = [];

		const boundTextures = this.bindTextures(node, context, commands);
		this.useShaderProgram(node, commands);
		this.setUniforms(node, boundTextures, commands);

		return commands;
	}

	private bindTextures(node: ShaderRenderGraphNode, context: RenderGraphCompileContext, commands: RenderGraphCommand[]): Map<RenderGraphNode, number> {
		const usedTextures = this.collectRequiredTextures(node);

		const textureUnitHandler = context.getCompileResource<TextureUnitHandler>(RenderGraphKeys.textureUnitHandler());

		const boundTextures = new Map<RenderGraphNode, number>();

		for (const property of node.getProperties()) {

			if (property instanceof TextureRenderGraphNode) {
				const textureName = RenderGraphKeys.texture(property);
				const textureUnit = textureUnitHandler.findTextureUnit(textureName, usedTextures);
				commands.push(new BindTextureRenderGraphCommand(textureName, textureUnit));
				boundTextures.set(property, textureUnit);
			}

			if (property instanceof ConditionalTextureRenderGraphNode) {
				const conditionalTextureName = RenderGraphKeys.texture(property);
				const textureUnit = textureUnitHandler.findTextureUnit(conditionalTextureName, usedTextures);
				property.getOptions().forEach(option => {
					const textureName = RenderGraphKeys.texture(option.texture);
					commands.push(new BindConditionalTextureRenderGraphCommand(textureName, textureUnit, option.condition));
				})
				boundTextures.set(property, textureUnit);
			}

			if (property instanceof RenderTargetRenderGraphNode) {
				const framebufferName = RenderGraphKeys.framebuffer((property as RenderTargetRenderGraphNode));
				const textureUnit = textureUnitHandler.findTextureUnit(framebufferName, usedTextures);
				commands.push(new BindFramebufferTextureRenderGraphCommand(framebufferName, textureUnit));
				boundTextures.set(property, textureUnit);
			}

		}

		return boundTextures;
	}

	private collectRequiredTextures(node: ShaderRenderGraphNode): string[] {
		return [
			...node
				.getInputs()
				.filter(it => it instanceof TextureRenderGraphNode)
				.map(it => RenderGraphKeys.texture(it as TextureRenderGraphNode)),
			...node
				.getInputs()
				.filter(it => it instanceof RenderTargetRenderGraphNode)
				.map(it => RenderGraphKeys.framebuffer(it as RenderTargetRenderGraphNode)),
		];
	}

	private useShaderProgram(node: ShaderRenderGraphNode, commands: RenderGraphCommand[]) {
		commands.push(new UseShaderRenderGraphCommand(RenderGraphKeys.shaderProgram(node)));
	}

	private setUniforms(node: ShaderRenderGraphNode, boundTextures: Map<RenderGraphNode, number>, commands: RenderGraphCommand[]) {
		const uniforms: ProgramUniformEntry[] = [];
		for (const namedProperty of node.getPropertiesNamed()) {
			const property = namedProperty.node;

			if(property instanceof ConstPropertyRenderGraphNode) {
				uniforms.push(new ProgramUniformEntry({
					binding: namedProperty.binding,
					valueConst: this.getValueProvider(property, boundTextures)(),
					type: property.getType()!,
				}));
				continue;
			}

			if (property instanceof TextureRenderGraphNode || property instanceof ConditionalTextureRenderGraphNode || property instanceof RenderTargetRenderGraphNode) {
				uniforms.push(new ProgramUniformEntry({
					binding: namedProperty.binding,
					valueConst: this.getValueProvider(property, boundTextures)(),
					type: property.getType()!,
				}));
				continue;
			}

			uniforms.push(new ProgramUniformEntry({
				binding: namedProperty.binding,
				valueProvider: this.getValueProvider(property, boundTextures),
				type: property.getType()!,
			}));
		}
		commands.push(new SetUniformsRenderGraphCommand(uniforms, RenderGraphKeys.shaderProgram(node)));
	}

	private getValueProvider(node: RenderGraphProperty<any>, boundTextures: Map<RenderGraphNode, number>): () => any {
		if (node instanceof TextureRenderGraphNode || node instanceof ConditionalTextureRenderGraphNode || node instanceof RenderTargetRenderGraphNode) {
			return node.getValueProvider(boundTextures);
		}
		return node.getValueProvider(null);
	}

}