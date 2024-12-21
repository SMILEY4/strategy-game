import {ResourceManager} from "../graph/resourceManager";
import {AbstractRenderNode} from "../graph/abstractRenderNode";
import {VertexRenderNode} from "../graph/vertexRenderNode";
import {DrawRenderNode} from "../graph/drawRenderNode";
import {GLVertexBuffer} from "../../../common/webgl/glVertexBuffer";
import {GLVertexArray} from "../../../common/webgl/glVertexArray";
import {GLProgram} from "../../../common/webgl/glProgram";
import {WebGLShaderSourceManager} from "./webGLShaderSourceManager";
import {GLTexture} from "../../../common/webgl/glTexture";
import {GLFramebuffer} from "../../../common/webgl/glFramebuffer";
import {NodeInput} from "../graph/nodeInput";
import {NodeOutput} from "../graph/nodeOutput";
import ManagedProgram = WebGLResourceManager.ManagedProgram;
import ManagedTexture = WebGLResourceManager.ManagedTexture;
import ManagedFramebuffer = WebGLResourceManager.ManagedFramebuffer;
import ManagedVertexBuffer = WebGLResourceManager.ManagedVertexBuffer;
import ManagedVertexData = WebGLResourceManager.ManagedVertexData;
import ManagedTextureAtlas = WebGLResourceManager.ManagedTextureAtlas;
import VertexAttribute = NodeOutput.VertexAttribute;
import VertexBuffer = NodeOutput.VertexBuffer;
import {TextureAtlas} from "../../../common/webgl/textureAtlas";
import {WebGLTextureAtlasDataManager} from "./webGLTextureAtlasDataManager";

export class WebGLResourceManager implements ResourceManager {

	private readonly gl: WebGL2RenderingContext;
	private readonly shaderSourceManager: WebGLShaderSourceManager;
	private readonly textureAtlasDataManager: WebGLTextureAtlasDataManager;

	private readonly vertexData = new Map<string, ManagedVertexData>();
	private readonly vertexBuffers = new Map<string, ManagedVertexBuffer>();
	private readonly shaders = new Map<string, ManagedProgram>();
	private readonly textures = new Map<string, ManagedTexture>();
	private readonly textureAtlases = new Map<string, ManagedTextureAtlas>();
	private readonly framebuffers = new Map<string, ManagedFramebuffer>();


	constructor(gl: WebGL2RenderingContext, shaderSourceManager: WebGLShaderSourceManager, textureAtlasDataManager: WebGLTextureAtlasDataManager) {
		this.gl = gl;
		this.shaderSourceManager = shaderSourceManager;
		this.textureAtlasDataManager = textureAtlasDataManager;
	}


	public initialize(nodes: AbstractRenderNode[]): void {
		console.log("Initializing webgl resources for render graph.");
		nodes.forEach(node => {
			console.debug("Initializing webgl resources for node", node.id, node);
			if (node instanceof VertexRenderNode) {
				for (let input of node.config.input) {
					if (input instanceof NodeInput.VertexBuffer) {
						this.initializeVertexBuffer(input.name, node);
					}
					if (input instanceof NodeInput.TextureAtlasData) {
						this.initializeTextureAtlas(input.path);
					}
				}
				for (let output of node.config.output) {
					if (output instanceof NodeOutput.VertexDescriptor) {
						this.initializeVertexDescriptor(output.name, output.type, output.buffers, node, nodes);
					}
					if (output instanceof NodeOutput.VertexBuffer) {
						this.initializeVertexBuffer(output.name, node);
					}
				}
			}
			if (node instanceof DrawRenderNode) {
				for (let input of node.config.input) {
					if (input instanceof NodeInput.Shader) {
						this.initializeShaderProgram(input.vertexId, input.fragmentId);
					}
					if (input instanceof NodeInput.Texture) {
						this.initializeTexture(input.path);
					}
					if (input instanceof NodeInput.TextureAtlas) {
						this.initializeTextureAtlas(input.path);
					}
				}
				for (let output of node.config.output) {
					// noinspection SuspiciousTypeOfGuard
					if (output instanceof NodeOutput.RenderTarget) {
						this.initializeFramebuffer(output.renderTargetId, output.depth, output.scale);
					}
				}
			}
		});
	}

	private initializeVertexBuffer(id: string, node: VertexRenderNode<any>): ManagedVertexBuffer {
		console.debug("Loading vertex-buffer with id", id);

		if (this.vertexBuffers.has(id)) {
			return this.vertexBuffers.get(id)!;
		}

		const buffer = node.config.output.find(e => e instanceof VertexBuffer && e.name === id)! as VertexBuffer;

		const managedBuffer: ManagedVertexBuffer = {
			id: id,
			attributes: buffer.attributes,
			buffer: GLVertexBuffer.createEmpty(this.gl),
		};
		this.vertexBuffers.set(managedBuffer.id, managedBuffer);

		return managedBuffer;
	}

	private initializeVertexDescriptor(id: string, type: "standart" | "instanced", bufferIds: string[], node: VertexRenderNode<any>, nodes: AbstractRenderNode[]): ManagedVertexData {
		console.debug("initializing vertex descriptor", id, type, bufferIds);

		// already initialized
		if (this.vertexData.has(id)) {
			return this.vertexData.get(id)!!;
		}

		// create & initialize vertex-buffers
		const buffers = new Map<string, ManagedVertexBuffer>();
		bufferIds
			.map(bufferId => this.initializeVertexBuffer(bufferId, node))
			.forEach(buffer => buffers.set(buffer.id, buffer));

		// find/create & initialize programs using this vertex-data
		const programs: ManagedProgram[] = [];
		for (const node of nodes) {
			if (node instanceof DrawRenderNode) {
				let usesData = false;
				for (let input of node.config.input) {
					if (input instanceof NodeInput.VertexDescriptor) {
						if (input.vertexDataId === id) {
							usesData = true;
						}
					}
				}
				if (usesData) {
					for (let input of node.config.input) {
						if (input instanceof NodeInput.Shader) {
							programs.push(this.initializeShaderProgram(input.vertexId, input.fragmentId));
						}
					}
				}
			}
		}

		// merge vertex attributes and gl-buffers
		const vertexAttributes: ({ bufferId: string, attribute: VertexAttribute })[] = [];
		bufferIds.forEach(bufferId => {
			const buffer = buffers.get(bufferId)!;
			buffer.attributes.forEach(attribute => {
				vertexAttributes.push({bufferId: buffer.id, attribute: attribute});
			});
		});

		function findProgramAttributeLocation(program: WebGLResourceManager.ManagedProgram, attribute: NodeOutput.VertexAttribute): number {
			const programAttribute = program.program.getInformation().attributes.find(a => a.name === attribute.name);
			if (programAttribute) {
				return programAttribute.location;
			} else {
				// attribute is not used in shader but needs to be included for correct calculation of offset & stride of other attributes
				return -1;
			}
		}

		// create vertex-arrays
		const vertexArrays = new Map<string, GLVertexArray>();
		for (const program of programs) {
			console.debug("create vertex array for descriptor", id, "and program", program.id);
			const vertexArray = GLVertexArray.create(
				this.gl,
				vertexAttributes
					.map(attribute => ({
						buffer: buffers.get(attribute.bufferId)!!.buffer,
						location: findProgramAttributeLocation(program, attribute.attribute),
						type: attribute.attribute.type,
						amountComponents: attribute.attribute.amountComponents,
						normalized: attribute.attribute.normalized,
						stride: attribute.attribute.stride,
						offset: attribute.attribute.offset,
						divisor: attribute.attribute.divisor,
						debugName: program.vertex + "-" + program.fragment + "/" + attribute.attribute.name
					})),
			);
			vertexArrays.set(program.id, vertexArray);
		}

		// register managed resource
		const managedVertexData: ManagedVertexData = {
			id: id,
			type: type,
			vertexCount: 0,
			instanceCount: 0,
			buffers: buffers,
			vertexArrays: vertexArrays,
		};
		this.vertexData.set(managedVertexData.id, managedVertexData);
		console.debug("Loaded vertex-data with id", managedVertexData.id);
		return managedVertexData;

	}

	private initializeShaderProgram(vertex: string, fragment: string): ManagedProgram {
		console.debug("Loading shader program with", vertex, fragment);

		const programId = this.getProgramId(vertex, fragment);
		if (this.shaders.has(programId)) {
			return this.shaders.get(programId)!;
		}
		const srcVertex = this.shaderSourceManager.get(vertex);
		const srcFragment = this.shaderSourceManager.get(fragment);
		const managedProgram: ManagedProgram = {
			id: programId,
			vertex: vertex,
			fragment: fragment,
			program: GLProgram.create(this.gl, srcVertex, srcFragment),
		};
		this.shaders.set(managedProgram.id, managedProgram);
		console.debug("Loaded shader program with id", managedProgram.id);
		return managedProgram;
	}

	private initializeTextureAtlas(path: string): ManagedTextureAtlas {
		console.debug("Loading texture atlas", path);
		if (this.textureAtlases.has(path)) {
			return this.textureAtlases.get(path)!;
		}
		const managedTextureAtlas: ManagedTextureAtlas = {
			id: path,
			textureAtlas: TextureAtlas.createFromData(this.gl, path, this.textureAtlasDataManager.getData(path))
		}
		this.textureAtlases.set(managedTextureAtlas.id, managedTextureAtlas)
		return managedTextureAtlas;
	}

	private initializeTexture(path: string): ManagedTexture {
		console.debug("Loading texture", path);
		if (this.textures.has(path)) {
			return this.textures.get(path)!;
		}
		const managedTexture: ManagedTexture = {
			id: path,
			path: path,
			texture: GLTexture.createFromPath(this.gl, path),
		};
		this.textures.set(managedTexture.id, managedTexture);
		return managedTexture;
	}

	private initializeFramebuffer(renderTargetId: string, depth: boolean, scale: number) {
		console.debug("Initializing framebuffer", renderTargetId, depth, scale);
		if (this.framebuffers.has(renderTargetId)) {
			return this.framebuffers.get(renderTargetId)!;
		}
		const managedFramebuffer: ManagedFramebuffer = {
			id: renderTargetId,
			renderTargetId: renderTargetId,
			scale: scale,
			framebuffer: GLFramebuffer.create(this.gl, 1, 1, depth),
		};
		this.framebuffers.set(managedFramebuffer.id, managedFramebuffer);
		return managedFramebuffer;
	}


	public dispose(): void {
		this.vertexData.forEach((data, _) => {
			data.vertexArrays.forEach((va, _) => {
				va.dispose();
			});
		});
		this.vertexData.clear();
		this.vertexBuffers.clear();

		this.shaders.forEach((shader, _) => {
			shader.program.dispose();
		});
		this.shaders.clear();

		this.textures.forEach((texture, _) => {
			texture.texture.dispose();
		});
		this.textures.clear();

		this.textureAtlases.forEach((atlas, _) => {
			atlas.textureAtlas.dispose();
		});
		this.textureAtlases.clear();

		this.framebuffers.forEach((framebuffer, _) => {
			framebuffer.framebuffer.dispose();
		});
		this.framebuffers.clear();
	}

	public getVertexData(id: string): ManagedVertexData {
		const managed = this.vertexData.get(id);
		if (managed) {
			return managed;
		} else {
			throw new Error("No vertex data with id " + id + " found");
		}
	}

	public getVertexBuffer(id: string): ManagedVertexBuffer {
		const managed = this.vertexBuffers.get(id);
		if (managed) {
			return managed;
		} else {
			throw new Error("No vertex buffer with id " + id + " found");
		}
	}

	public getProgram(vertex: string, fragment: string): ManagedProgram {
		const programId = this.getProgramId(vertex, fragment);
		const managed = this.shaders.get(programId);
		if (managed) {
			return managed;
		} else {
			throw new Error("No shader program with id " + programId + " found");
		}
	}

	public getProgramId(vertex: string, fragment: string): string {
		return vertex + "-" + fragment;
	}

	public getTexture(path: string): ManagedTexture {
		const managed = this.textures.get(path);
		if (managed) {
			return managed;
		} else {
			throw new Error("No texture with id " + path + " found");
		}
	}

	public getTextureAtlas(path: string): ManagedTextureAtlas {
		const managed = this.textureAtlases.get(path);
		if (managed) {
			return managed;
		} else {
			throw new Error("No texture atlas with id " + path + " found");
		}
	}

	public getFramebuffer(id: string): ManagedFramebuffer {
		const managed = this.framebuffers.get(id);
		if (managed) {
			return managed;
		} else {
			throw new Error("No framebuffer with id " + id + " found");
		}
	}

}


export namespace WebGLResourceManager {

	export interface ManagedVertexBuffer {
		id: string,
		attributes: VertexAttribute[],
		buffer: GLVertexBuffer,
	}

	export interface ManagedVertexData {
		id: string,
		type: "standart" | "instanced",
		vertexCount: number,
		instanceCount: number,
		buffers: Map<string, ManagedVertexBuffer>,
		vertexArrays: Map<string, GLVertexArray>
	}

	export interface ManagedProgram {
		id: string,
		vertex: string,
		fragment: string,
		program: GLProgram
	}

	export interface ManagedTexture {
		id: string,
		path: string,
		texture: GLTexture
	}

	export interface ManagedTextureAtlas {
		id: string,
		textureAtlas: TextureAtlas
	}

	export interface ManagedFramebuffer {
		id: string,
		renderTargetId: string,
		scale: number,
		framebuffer: GLFramebuffer
	}

}