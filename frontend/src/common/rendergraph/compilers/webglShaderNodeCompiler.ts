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
import {PropertyConstRenderGraphNode} from "../nodes/propertyConstRenderGraphNode";
import {ConditionalRenderGraphNode} from "../nodes/conditionalRenderGraphNode";
import {BindTextureConditionalRenderGraphCommand} from "../commands/bindTextureConditionalRenderGraphCommand";

export class WebglShaderNodeCompiler implements RenderGraphNodeCompiler<ShaderRenderGraphNode> {

	isInlineCompile(): boolean {
		return false;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof ShaderRenderGraphNode;
	}

	compile(node: ShaderRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		const commands: RenderGraphCommand[] = [];

		const boundTextures = this.bindTextures(node, context, commands);
		this.useShaderProgram(node, commands);
		this.setUniforms(node, boundTextures, commands)

		return commands;
	}

	private bindTextures(node: ShaderRenderGraphNode, context: RenderGraphCompileContext, commands: RenderGraphCommand[]): Map<RenderGraphNode<any>, number> {
		const usedTextures = this.collectRequiredTextures(node)

		const textureUnitHandler = context.getCompileResource<TextureUnitHandler>(RenderGraphKeys.textureUnitHandler());

		const boundTextures = new Map<RenderGraphNode<any>, number>();

		for (const property of node.getProperties()) {

			if (property instanceof TextureRenderGraphNode) {
				const textureName = RenderGraphKeys.texture(property);
				const textureUnit = textureUnitHandler.findTextureUnit(textureName, usedTextures);
				commands.push(new BindTextureRenderGraphCommand(textureName, textureUnit));
				boundTextures.set(property, textureUnit);
			}

			if (property instanceof RenderTargetRenderGraphNode) {
				const framebufferName = RenderGraphKeys.framebuffer((property as RenderTargetRenderGraphNode));
				const textureUnit = textureUnitHandler.findTextureUnit(framebufferName, usedTextures);
				commands.push(new BindFramebufferTextureRenderGraphCommand(framebufferName, textureUnit));
				boundTextures.set(property, textureUnit);
			}

			if(property instanceof ConditionalRenderGraphNode) {
				const options = property.getOptions();
				if(options.every(it => it.value instanceof TextureRenderGraphNode)) {
					const textureOptions = options.map(it => it.value as TextureRenderGraphNode);
					const textureUnit = textureUnitHandler.findTextureUnit(RenderGraphKeys.conditionalTexture(textureOptions), usedTextures);
					commands.push(new BindTextureConditionalRenderGraphCommand(
						options.map(it => ({
							value : RenderGraphKeys.texture((it.value as TextureRenderGraphNode)),
							condition : it.condition
						})),
						textureUnit
					));
					boundTextures.set(property, textureUnit);
				}
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
			...node
				.getInputs()
				.filter(it => (it instanceof ConditionalRenderGraphNode) && (it as ConditionalRenderGraphNode<any>).getOptions().every(it => it.value instanceof TextureRenderGraphNode))
				.map(it => RenderGraphKeys.conditionalTexture((it as ConditionalRenderGraphNode<any>).getOptions().map(it => it.value as TextureRenderGraphNode)))
		]
	}

	private useShaderProgram(node: ShaderRenderGraphNode, commands: RenderGraphCommand[]) {
		commands.push(new UseShaderRenderGraphCommand(RenderGraphKeys.shaderProgram(node)));
	}

	private setUniforms(node: ShaderRenderGraphNode, boundTextures: Map<RenderGraphNode<any>, number>, commands: RenderGraphCommand[]) {
		const uniforms: ProgramUniformEntry[] = [];
		for (const namedProperty of node.getPropertiesNamed()) {
			const property = namedProperty.node;

			if (property instanceof TextureRenderGraphNode) {
				const textureUnit = boundTextures.get(property)!;
				uniforms.push(new ProgramUniformEntry({
					valueConst: textureUnit,
					binding: namedProperty.binding,
					type: GLUniformType.SAMPLER_2D
				}));
			}

			if (property instanceof RenderTargetRenderGraphNode) {
				const textureUnit = boundTextures.get(property)!;
				uniforms.push(new ProgramUniformEntry({
					valueConst: textureUnit,
					binding: namedProperty.binding,
					type: GLUniformType.SAMPLER_2D
				}));
			}

			if (property instanceof PropertyRenderGraphNode) {
				uniforms.push(new ProgramUniformEntry({
					valueProvider: () => (property.getProvider()() as any as GLUniformValueType),
					binding: namedProperty.binding,
					type: property.getType()!
				}));
			}

			if (property instanceof PropertyConstRenderGraphNode) {
				uniforms.push(new ProgramUniformEntry({
					valueConst: property.getValue() as any as GLUniformValueType,
					binding: namedProperty.binding,
					type: property.getType()!
				}));
			}

			if(property instanceof ConditionalRenderGraphNode) {
				const options = property.getOptions();
				if(options.every(it => it.value instanceof TextureRenderGraphNode)) {
					const textureUnit = boundTextures.get(property)!;
					uniforms.push(new ProgramUniformEntry({
						valueConst: textureUnit,
						binding: namedProperty.binding,
						type: GLUniformType.SAMPLER_2D
					}));
				}
			}

		}
		commands.push(new SetUniformsRenderGraphCommand(uniforms, RenderGraphKeys.shaderProgram(node)));
	}

}