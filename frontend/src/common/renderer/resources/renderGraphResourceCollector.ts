import {RenderGraphResourceDefinition} from "./renderGraphResourceDefinition";
import {RenderGraphResource} from "./renderGraphResource";
import {RenderGraphNode} from "../nodes/renderGraphNode";
import {NodeInputDefinition} from "../inputoutput/nodeInputDefinitions";
import {NodeOutputDefinition} from "../inputoutput/nodeOutputDefinitions";
import {ShaderProgramResource} from "./shaderProgramResource";
import {RenderGraphContext} from "../renderGraphContext";
import {GLProgram} from "../../webgl/glProgram";
import {TextureResource} from "./textureResource";
import {GLTexture} from "../../webgl/glTexture";
import {GenericDataResource} from "./genericDataResource";
import {VertexBufferResource} from "./vertexBufferResource";
import {GLVertexBuffer} from "../../webgl/glVertexBuffer";
import {VertexInfoResource} from "./vertexInfoResource";

export class RenderGraphResourceCollector {

	public collectDefinitions(nodes: RenderGraphNode[], context: RenderGraphContext): RenderGraphResourceDefinition<RenderGraphResource>[] {
		const resourceDefinitions = new Map<string, RenderGraphResourceDefinition<RenderGraphResource>>;

		for (const node of nodes) {

			for (const input of node.inputs) {
				if (input instanceof NodeInputDefinition.ShaderProgram) {
					// @ts-ignore
					const resource = this.buildShaderProgram(input) as RenderGraphResourceDefinition<RenderGraphResource>;
					resourceDefinitions.set(resource.key, resource);
				}
				if (input instanceof NodeInputDefinition.Texture) {
					// @ts-ignore
					const resource = this.buildTexture(input) as RenderGraphResourceDefinition<RenderGraphResource>;
					resourceDefinitions.set(resource.key, resource);
				}
				if (input instanceof NodeInputDefinition.ConditionalTexture) {
					// todo
				}
			}


			for (const output of node.outputs) {
				if (output instanceof NodeOutputDefinition.GenericData) {
					// @ts-ignore
					const resource = this.buildGenericData(output) as RenderGraphResourceDefinition<RenderGraphResource>;
					resourceDefinitions.set(resource.key, resource);
				}
				if (output instanceof NodeOutputDefinition.VertexBuffer) {
					// @ts-ignore
					const resource = this.buildVertexBuffer(output) as RenderGraphResourceDefinition<RenderGraphResource>;
					resourceDefinitions.set(resource.key, resource);
				}
				if (output instanceof NodeOutputDefinition.VertexDescriptor) {
					// todo
				}
				if (output instanceof NodeOutputDefinition.RenderTarget) {
					// todo
				}
			}

		}

		return resourceDefinitions;
	}

	private buildShaderProgram(input: NodeInputDefinition.ShaderProgram): RenderGraphResourceDefinition<ShaderProgramResource> {
		const resourceKey = "shaderprogram-" + input.vertexKey + "-" + input.fragmentKey;
		return {
			key: resourceKey,
			load: (context: RenderGraphContext) => {
				const gl = context.get<WebGL2RenderingContext>(RenderGraphContext.KEY_GL_CONTEXT);
				return new ShaderProgramResource(
					resourceKey,
					GLProgram.create(gl, "srcVertex", "srcFragment"), // todo: sources
				);
			},
			unload: (resource: ShaderProgramResource, context: RenderGraphContext) => {
				resource.program.dispose();
			},
		} as RenderGraphResourceDefinition<ShaderProgramResource>;
	}


	private buildTexture(input: NodeInputDefinition.Texture): RenderGraphResourceDefinition<TextureResource> {
		const resourceKey = "texture-" + input.path;
		return {
			key: resourceKey,
			load: (context: RenderGraphContext) => {
				const gl = context.get<WebGL2RenderingContext>(RenderGraphContext.KEY_GL_CONTEXT);
				return new TextureResource(
					resourceKey,
					GLTexture.createFromPath(gl, input.path, input.config),
				);
			},
			unload: (resource: TextureResource, context: RenderGraphContext) => {
				resource.texture.dispose();
			},
		} as RenderGraphResourceDefinition<TextureResource>;
	}


	private buildGenericData(input: NodeInputDefinition.GenericData): RenderGraphResourceDefinition<GenericDataResource<any>> {
		const resourceKey = "genericdata-" + input.key;
		return {
			key: resourceKey,
			load: (context: RenderGraphContext) => {
				return new GenericDataResource<any>(
					resourceKey,
					undefined,
				);
			},
			unload: (resource: GenericDataResource<any>, context: RenderGraphContext) => {
			},
		} as RenderGraphResourceDefinition<GenericDataResource<any>>;
	}

	private buildVertexBuffer(input: NodeInputDefinition.VertexBuffer): RenderGraphResourceDefinition<VertexBufferResource> {
		const resourceKey = "vertexbuffer-" + input.key;
		return {
			key: resourceKey,
			load: (context: RenderGraphContext) => {
				const gl = context.get<WebGL2RenderingContext>(RenderGraphContext.KEY_GL_CONTEXT);
				return new VertexBufferResource(
					resourceKey,
					GLVertexBuffer.createEmpty(gl),
				);
			},
			unload: (resource: VertexBufferResource, context: RenderGraphContext) => {
				resource.buffer.dispose();
			},
		} as RenderGraphResourceDefinition<VertexBufferResource>;
	}

	private buildVertexDescriptor(nodes: RenderGraphNode[], output: NodeOutputDefinition.VertexDescriptor): RenderGraphResourceDefinition<VertexInfoResource> {
		const key = "vertexdescriptor-" + output.key;

		// find all programs using this vertex descriptor
		const programs: NodeInputDefinition.ShaderProgram[] = [];
		for (const node of nodes) {
			let usesVertexDescriptor = false;
			for (let nodeInput of node.inputs) {
				if (nodeInput instanceof NodeInputDefinition.VertexDescriptor) {
					if (nodeInput.key == output.key) {
						usesVertexDescriptor = true;
					}
				}
			}
			if(usesVertexDescriptor) {
				for (let nodeInput of node.inputs) {
					if (nodeInput instanceof NodeInputDefinition.ShaderProgram) {
						programs.push(nodeInput);
					}
				}
			}
		}

		return {
			key: key,
			load: (context: RenderGraphContext) => {
				return new VertexInfoResource(
					key,
					output.type,
					output.buffers,
					0,
					0,
				);
			},
			unload: (resource: VertexInfoResource, context: RenderGraphContext) => undefined,
		};

	}


}
