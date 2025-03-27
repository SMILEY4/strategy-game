import {RenderCommand} from "../graph/renderCommand";
import {WebGLResourceManager} from "./webGLResourceManager";
import {GLFramebuffer} from "../../../common/webgl/glFramebuffer";
import {ProgramUniformEntry} from "./programUniformEntry";
import {VertexRenderNode} from "../graph/vertexRenderNode";
import {BaseRenderer} from "../../../common/webgl/baseRenderer";
import {Camera} from "../../../common/webgl/camera";
import {ChangeProvider} from "../graph/changeProvider";
import {WebGlProvidedNodeInputs} from "./webGLProvidedNodeInputs";
import {RenderGraphMonitor} from "../graph/renderGraphMonitor";

export namespace WebGLRenderCommand {

	export interface Context {
		gl: WebGL2RenderingContext,
		renderer: BaseRenderer,
		monitor: RenderGraphMonitor,
		camera: Camera,
	}

	/**
	 * base webgl command
	 */
	export interface Base extends RenderCommand<WebGLResourceManager, Context> {
		getDebugData(): any;
	}


	/**
	 * Update data of a vertex buffer
	 */
	export class UpdateVertexBufferData implements Base {
		private readonly node: VertexRenderNode<any>;
		private readonly changeProvider: ChangeProvider;

		constructor(node: VertexRenderNode<any>, changeProvider: ChangeProvider) {
			this.node = node;
			this.changeProvider = changeProvider;
		}

		public execute(resourceManager: WebGLResourceManager, context: Context): void {
			context.monitor.startCommand("UpdateVertexBufferData-" + this.node.id)
			if (this.node.config.changeKey == null || this.changeProvider.hasChange(this.node.config.changeKey)) {
				const providedInputs = new WebGlProvidedNodeInputs(this.node.config.input, resourceManager);
				const modified = this.node.execute(context, providedInputs);
				if (modified.buffers.size > 0) {
					for (let [modifiedId, modifiedData] of modified.buffers) {
						const buffer = resourceManager.getVertexBuffer(modifiedId).buffer;
						buffer.setData(modifiedData.data, true);
					}
				}
				if (modified.outputs.size > 0) {
					for (let [modifiedId, modifiedData] of modified.outputs) {
						const data = resourceManager.getVertexData(modifiedId);
						data.vertexCount = modifiedData.vertexCount;
						data.instanceCount = modifiedData.instanceCount;
					}
				}
			}
			context.monitor.endCommand()
		}

		public getDebugData(): any {
			return {
				command: "UpdateVertexBufferData",
				node: this.node.id,
			};
		}

	}

	/**
	 * Bind a render-target to start rendering to  it
	 */
	export class BindFramebuffer implements Base {

		private readonly name: string;

		constructor(name: string) {
			this.name = name;
		}

		public execute(resourceManager: WebGLResourceManager, context: Context): void {
			context.monitor.startCommand("BindFramebuffer-" + this.name);
			const data = resourceManager.getFramebuffer(this.name);
			const framebuffer = data.framebuffer;
			framebuffer.bind();
			framebuffer.resize(context.camera.getWidth() * data.scale, context.camera.getHeight() * data.scale);
			context.monitor.endCommand()
		}

		public getDebugData(): any {
			return {
				command: "BindFramebuffer",
				framebuffer: this.name,
			};
		}
	}

	/**
	 * Unbind the active render-target to stop rendering to it
	 */
	export class UnbindFramebuffer implements Base {

		public execute(resourceManager: WebGLResourceManager, context: Context): void {
			context.monitor.startCommand("UnbindFramebuffer")
			GLFramebuffer.unbind(context.gl);
			context.monitor.endCommand()
		}

		public getDebugData(): any {
			return {
				command: "UnbindFramebuffer",
			};
		}
	}

	/**
	 * Bind a texture to the given texture textureUnit
	 */
	export class BindTexture implements Base {

		readonly path: string;
		readonly textureUnit: number;

		constructor(path: string, slot: number) {
			this.path = path;
			this.textureUnit = slot;
		}

		public execute(resourceManager: WebGLResourceManager, context: Context): void {
			context.monitor.startCommand("BindTexture-" + this.path + "-" + this.textureUnit)
			resourceManager.getTexture(this.path).texture.bind(this.textureUnit);
			context.monitor.endCommand()
		}

		public getDebugData(): any {
			return {
				command: "BindTexture",
				texture: this.path,
				textureUnit: this.textureUnit,
			};
		}
	}

    /**
     * Bind a conditional texture to the given texture textureUnit
     */
    export class BindConditionalTexture implements Base {

        private readonly id: string;
        private readonly paths: ({ path: string, condition: (ctx: Context) => boolean })[];
        private readonly textureUnit: number;

        constructor(id: string, slot: number, paths: ({ path: string, condition: (ctx: Context) => boolean })[]) {
            this.id = id;
            this.paths = paths;
            this.textureUnit = slot;
        }

        public execute(resourceManager: WebGLResourceManager, context: Context): void {
			context.monitor.startCommand("BindConditionalTexture-" + this.id + "-" + this.textureUnit)
			for (let i = 0; i < this.paths.length; i++) {
                const entry = this.paths[i];
                if(entry.condition(context)) {
                    resourceManager.getTexture(entry.path).texture.bind(this.textureUnit);
                    break;
                }
            }
			context.monitor.endCommand()
        }

        public getDebugData(): any {
            return {
                command: "BindTexture",
                texture: this.id,
                textureUnit: this.textureUnit,
            };
        }
    }

	/**
	 * Bind the texture of a render-target to the given texture textureUnit
	 */
	export class BindFramebufferTexture implements Base {

		private readonly name: string;
		private readonly textureUnit: number;

		constructor(name: string, slot: number) {
			this.name = name;
			this.textureUnit = slot;
		}

		public execute(resourceManager: WebGLResourceManager, context: Context): void {
			context.monitor.startCommand("BindFramebufferTexture-" + this.name + "-" + this.textureUnit);
			resourceManager.getFramebuffer(this.name).framebuffer.bindTexture(this.textureUnit);
			context.monitor.endCommand()
		}

		public getDebugData(): any {
			return {
				command: "BindFramebufferTexture",
				framebuffer: this.name,
				textureUnit: this.textureUnit,
			};
		}
	}

	/**
	 * Bind a vertex-array to render it
	 */
	export class BindVertexArray implements Base {

		private readonly name: string;
		private readonly vertex: string;
		private readonly fragment: string;

		constructor(name: string, vertex: string, fragment: string) {
			this.name = name;
			this.vertex = vertex;
			this.fragment = fragment;
		}

		public execute(resourceManager: WebGLResourceManager, context: Context): void {
			context.monitor.startCommand("BindVertexArray-" + this.name);
			const programId = resourceManager.getProgramId(this.vertex, this.fragment);
			resourceManager.getVertexData(this.name).vertexArrays.get(programId)!.bind();
			context.monitor.endCommand()
		}

		public getDebugData(): any {
			return {
				command: "BindVertexArray",
				vertexShader: this.vertex,
				fragmentShader: this.fragment,
			};
		}
	}

	/**
	 * Unbind a vertex-array to stop using it
	 */
	export class UnbindVertexArray implements Base {

		private readonly name: string;
		private readonly vertex: string;
		private readonly fragment: string;

		constructor(name: string, vertex: string, fragment: string) {
			this.name = name;
			this.vertex = vertex;
			this.fragment = fragment;
		}

		public execute(resourceManager: WebGLResourceManager, context: Context): void {
			context.monitor.startCommand("UnbindVertexArray-" + this.name);
			const programId = resourceManager.getProgramId(this.vertex, this.fragment);
			resourceManager.getVertexData(this.name).vertexArrays.get(programId)!.unbind();
			context.monitor.endCommand()
		}

		public getDebugData(): any {
			return {
				command: "UnbindVertexArray",
				vertexShader: this.vertex,
				fragmentShader: this.fragment,
			};
		}
	}

	/**
	 * Start using the shader
	 */
	export class UseShader implements Base {

		private readonly vertex: string;
		private readonly fragment: string;

		constructor(vertex: string, fragment: string) {
			this.vertex = vertex;
			this.fragment = fragment;
		}

		public execute(resourceManager: WebGLResourceManager, context: Context): void {
			context.monitor.startCommand("UseShader-" + this.vertex + "-" + this.fragment);
			resourceManager.getProgram(this.vertex, this.fragment).program.use();
			context.monitor.endCommand()
		}

		public getDebugData(): any {
			return {
				command: "UseShader",
				vertexShader: this.vertex,
				fragmentShader: this.fragment,
			};
		}
	}

	/**
	 * Set the shader uniform values
	 */
	export class SetUniforms implements Base {

		private readonly uniforms: ProgramUniformEntry[];
		private readonly vertex: string;
		private readonly fragment: string;


		constructor(uniforms: ProgramUniformEntry[], vertex: string, fragment: string) {
			this.uniforms = uniforms;
			this.vertex = vertex;
			this.fragment = fragment;
		}

		public execute(resourceManager: WebGLResourceManager, context: Context): void {
			context.monitor.startCommand("SetUniforms-" + this.vertex + "-" + this.fragment)
			const program = resourceManager.getProgram(this.vertex, this.fragment).program;
			for (let i = 0; i < this.uniforms.length; i++) {
				const uniform = this.uniforms[i];
				if (uniform.valueConstant !== null) {
					program.setUniform(uniform.binding, uniform.type, uniform.valueConstant);
				}
				if (uniform.valueProvider !== null) {
					program.setUniform(uniform.binding, uniform.type, uniform.valueProvider(context));
				}
			}
			context.monitor.endCommand()
		}

		public getDebugData(): any {
			return {
				command: "SetUniforms",
				uniforms: this.uniforms.map(it => it.binding),
				vertexShader: this.vertex,
				fragmentShader: this.fragment,
			};
		}
	}

	/**
	 * Make a draw call
	 */
	export class Draw implements Base {

		private readonly vertexDataId: string;
		private readonly clearColor: [number, number, number, number];
		private readonly blendFunction: ((gl: WebGL2RenderingContext) => void) | null;
		private readonly renderToTexture: boolean;
		private readonly renderScale: number;
		private readonly depth: boolean;

		constructor(vertexDataId: string, clearColor: [number, number, number, number], blendFunction: ((gl: WebGL2RenderingContext) => void) | null, renderToTexture: boolean, renderScale: number, depth: boolean) {
			this.vertexDataId = vertexDataId;
			this.clearColor = clearColor;
			this.blendFunction = blendFunction;
			this.renderToTexture = renderToTexture;
			this.renderScale = renderScale;
			this.depth = depth;
		}

		public execute(resourceManager: WebGLResourceManager, context: Context): void {
			context.monitor.startCommand("Draw-" + this.vertexDataId)
			context.renderer.prepareFrame(context.camera, this.clearColor, this.blendFunction, this.renderToTexture, this.renderScale, this.depth);
			const data = resourceManager.getVertexData(this.vertexDataId);
			switch (data.type) {
				case "standart": {
					context.renderer.draw(data.vertexCount);
					break;
				}
				case "instanced": {
					context.renderer.drawInstanced(data.vertexCount, data.instanceCount);
					break;
				}
			}
			context.monitor.endCommand()
		}

		public getDebugData(): any {
			return {
				command: "Draw",
				vertexData: this.vertexDataId,
				clearColor: this.clearColor,
				renderToTexture: this.renderToTexture,
				renderScale: this.renderScale,
				depth: this.depth,
			};
		}
	}


}