import {RenderGraphNode} from "./renderGraphNode";
import {NodeInputDefinition} from "../inputoutput/nodeInputDefinitions";
import {RenderGraphNodeCompiler} from "../base/renderGraphNodeCompiler";
import {RenderGraphCommand} from "../renderGraphCommand";
import {NodeOutputDefinition} from "../inputoutput/nodeOutputDefinitions";
import {RenderGraphResourceManager} from "../resources/renderGraphResourceManager";
import {ProgramUniformEntry} from "../../../renderer/common/webgl/programUniformEntry";
import {FramebufferResource} from "../resources/framebufferResource";
import {GLFramebuffer} from "../../webgl/glFramebuffer";
import {RenderGraphContext} from "../renderGraphContext";
import {Camera} from "../../webgl/camera";
import {TextureResource} from "../resources/textureResource";
import {ShaderProgramResource} from "../resources/shaderProgramResource";

/**
 * Draw vertex data to the screen
 */
export class DrawNode extends RenderGraphNode {


	constructor(config: {
		/**
		 * Node inputs
		 */
		inputs: (NodeInputDefinition.VertexDescriptor | NodeInputDefinition.ShaderProgram | NodeInputDefinition.Texture | NodeInputDefinition.ConditionalTexture | NodeInputDefinition.RenderTarget)[], //  conditionaltexture,  property, clearcolor, blendmode
		/**
		 * Node outputs
		 */
		outputs: (NodeOutputDefinition.Screen | NodeOutputDefinition.RenderTarget)[],

	}) {
		super(config.inputs, config.outputs);
	}
}

export namespace DrawNode {

	export class Compiler implements RenderGraphNodeCompiler {

		handles(node: RenderGraphNode): boolean {
			return node instanceof DrawNode;
		}

		validate(node: RenderGraphNode): string[] {
			return [];
		}

		compile(renderGraphNode: RenderGraphNode, previousCommands: RenderGraphCommand[]): RenderGraphCommand[] {

			const commands: RenderGraphCommand[] = [];

			const node = renderGraphNode as DrawNode;
			const changeKeys = node.inputs.flatMap(it => it.getChangeKeys());

			// bind framebuffer
			let renderTarget: NodeOutputDefinition.RenderTarget | null = null;
			for (const output of node.outputs) {
				if (output instanceof NodeOutputDefinition.RenderTarget) {
					renderTarget = output;
					commands.push(new DrawNode.BindFramebufferCommand(changeKeys, output.key, output.scalingFactor));
				}
			}

			// bind textures
			for (const input of node.inputs) {
				if (input instanceof NodeInputDefinition.Texture) {
					const textureUnit = 0; // todo
					commands.push(new DrawNode.BindTextureCommand(changeKeys, input.path, textureUnit));
				}
				if (input instanceof NodeInputDefinition.ConditionalTexture) {
					commands.push(new DrawNode.BindTextureConditionalCommand(changeKeys));
				}
				if (input instanceof NodeInputDefinition.RenderTarget) {
					commands.push(new DrawNode.BindTextureFramebufferCommand(changeKeys));
				}
			}

			// use shader
			for (const input of node.inputs) {
				if (input instanceof NodeInputDefinition.ShaderProgram) {
					commands.push(new DrawNode.UseShaderCommand(changeKeys, input.vertexKey, input.fragmentKey));
					break;
				}
			}

			// set uniforms
			const uniforms: ProgramUniformEntry[] = [];
			for (const input of node.inputs) {
				// todo
				if (input instanceof NodeInputDefinition.Texture) {
				}
				if (input instanceof NodeInputDefinition.ConditionalTexture) {
				}
				if (input instanceof NodeInputDefinition.RenderTarget) {
				}
			}
			if (uniforms.length > 0) {
				commands.push(new DrawNode.SetUniformValuesCommand(changeKeys));
			}


			// bind vertex array
			for (const input of node.inputs) {
				if (input instanceof NodeInputDefinition.VertexDescriptor) {
					commands.push(new DrawNode.BindVertexDescriptorCommand(changeKeys));
					break;
				}
			}

			// draw call
			commands.push(new DrawNode.DrawCommand(changeKeys));

			// unbind vertex array
			commands.push(new DrawNode.UnbindVertexDescriptorCommand(changeKeys));

			// unbind framebuffer
			if (renderTarget) {
				commands.push(new DrawNode.UnbindFramebufferCommand(changeKeys));
			}

			return commands;
		}

	}

	/**
	 * Bind a frame buffer to start drawing to
	 */
	export class BindFramebufferCommand extends RenderGraphCommand {

		private readonly renderTargetKey: string;
		private readonly scalingFactor: number;

		constructor(changeKeys: string[], framebufferKey: string, scalingFactor: number) {
			super(changeKeys);
			this.renderTargetKey = framebufferKey;
			this.scalingFactor = scalingFactor;
		}

		onExecute(resourceManager: RenderGraphResourceManager, context: RenderGraphContext): void {
			const framebuffer = resourceManager.requestResource<FramebufferResource>(this.renderTargetKey).framebuffer;
			const camera = context.get<Camera>(RenderGraphContext.KEY_CAMERA);
			framebuffer.bind();
			framebuffer.resize(camera.getWidth() * this.scalingFactor, camera.getHeight() * this.scalingFactor);
		}

	}

	/**
	 * Unbind a frame buffer to stop drawing to
	 */
	export class UnbindFramebufferCommand extends RenderGraphCommand {

		constructor(changeKeys: string[]) {
			super(changeKeys);
		}

		onExecute(resourceManager: RenderGraphResourceManager, context: RenderGraphContext): void {
			const gl = context.get<WebGL2RenderingContext>(RenderGraphContext.KEY_GL_CONTEXT);
			GLFramebuffer.unbind(gl);
		}

	}

	/**
	 * Bind a texture to use during drawing
	 */
	export class BindTextureCommand extends RenderGraphCommand {

		private readonly path: string;
		private readonly textureUnit: number;

		constructor(changeKeys: string[], path: string, textureUnit: number) {
			super(changeKeys);
			this.path = path;
			this.textureUnit = textureUnit;
		}

		onExecute(resourceManager: RenderGraphResourceManager, context: RenderGraphContext): void {
			const texture = resourceManager.requestResource<TextureResource>(this.path).texture;
			texture.bind(this.textureUnit);
		}

	}

	/**
	 * Bind a frame buffer to use as a texture during drawing
	 */
	export class BindTextureFramebufferCommand extends RenderGraphCommand {

		private readonly framebufferKey: string;
		private readonly textureUnit: number;

		constructor(changeKeys: string[], framebufferKey: string, textureUnit: number) {
			super(changeKeys);
			this.framebufferKey = framebufferKey;
			this.textureUnit = textureUnit;
		}

		onExecute(resourceManager: RenderGraphResourceManager, context: RenderGraphContext): void {
			const framebuffer = resourceManager.requestResource<FramebufferResource>(this.framebufferKey).framebuffer;
			framebuffer.bindTexture(this.textureUnit);
		}

	}

	/**
	 * Bind a conditional texture to use during drawing
	 */
	export class BindTextureConditionalCommand extends RenderGraphCommand {

		constructor(changeKeys: string[]) {
			super(changeKeys);
		}

		onExecute(resourceManager: RenderGraphResourceManager, context: RenderGraphContext): void {
			// todo
		}

	}


	/**
	 * Start using the given shader
	 */
	export class UseShaderCommand extends RenderGraphCommand {

		private readonly vertexKey: string
		private readonly fragmentKey: string

		constructor(changeKeys: string[], vertexKey: string, fragmentKey: string) {
			super(changeKeys);
			this.vertexKey = vertexKey;
			this.fragmentKey = fragmentKey;
		}

		onExecute(resourceManager: RenderGraphResourceManager, context: RenderGraphContext): void {
			const framebuffer = resourceManager.requestResource<ShaderProgramResource>(this.framebufferKey).framebuffer;
		}

	}

	/**
	 * Set uniform values
	 */
	export class SetUniformValuesCommand extends RenderGraphCommand {

		constructor(changeKeys: string[]) {
			super(changeKeys);
		}

		onExecute(resourceManager: RenderGraphResourceManager, context: RenderGraphContext): void {
			// todo
		}

	}


	/**
	 * Bind vertex information
	 */
	export class BindVertexDescriptorCommand extends RenderGraphCommand {

		constructor(changeKeys: string[]) {
			super(changeKeys);
		}

		onExecute(resourceManager: RenderGraphResourceManager, context: RenderGraphContext): void {
			// todo
		}

	}

	/**
	 * Unbind vertex information
	 */
	export class UnbindVertexDescriptorCommand extends RenderGraphCommand {

		constructor(changeKeys: string[]) {
			super(changeKeys);
		}

		onExecute(resourceManager: RenderGraphResourceManager, context: RenderGraphContext): void {
			// todo
		}

	}


	/**
	 * Perform a draw call
	 */
	export class DrawCommand extends RenderGraphCommand {

		constructor(changeKeys: string[]) {
			super(changeKeys);
		}

		onExecute(resourceManager: RenderGraphResourceManager, context: RenderGraphContext): void {
			// todo
		}

	}

}