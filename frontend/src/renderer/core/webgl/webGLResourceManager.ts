import {ResourceManager} from "../graph/resourceManager";
import {AbstractRenderNode} from "../graph/abstractRenderNode";
import {VertexDataOutputConfig, VertexDataType, VertexRenderNode} from "../graph/vertexRenderNode";
import {DrawRenderNode, DrawRenderNodeInput, DrawRenderNodeOutput} from "../graph/drawRenderNode";
import {GLVertexBuffer} from "../../../shared/webgl/glVertexBuffer";
import {GLVertexArray} from "../../../shared/webgl/glVertexArray";
import {GLProgram} from "../../../shared/webgl/glProgram";
import {WebGLShaderSourceManager} from "./webGLShaderSourceManager";
import {GLTexture} from "../../../shared/webgl/glTexture";
import {GLFramebuffer} from "../../../shared/webgl/glFramebuffer";
import ManagedProgram = WebGLResourceManager.ManagedProgram;
import ManagedTexture = WebGLResourceManager.ManagedTexture;
import ManagedFramebuffer = WebGLResourceManager.ManagedFramebuffer;
import ManagedVertexBuffer = WebGLResourceManager.ManagedVertexBuffer;
import ManagedVertexData = WebGLResourceManager.ManagedVertexData;

export class WebGLResourceManager implements ResourceManager {

    private readonly gl: WebGL2RenderingContext;
    private readonly shaderSourceManager: WebGLShaderSourceManager;

    private readonly vertexData = new Map<string, ManagedVertexData>();
    private readonly vertexBuffers = new Map<string, ManagedVertexBuffer>();
    private readonly shaders = new Map<string, ManagedProgram>();
    private readonly textures = new Map<string, ManagedTexture>();
    private readonly framebuffers = new Map<string, ManagedFramebuffer>();


    constructor(gl: WebGL2RenderingContext, shaderSourceManager: WebGLShaderSourceManager) {
        this.gl = gl;
        this.shaderSourceManager = shaderSourceManager;
    }


    public initialize(nodes: AbstractRenderNode[]): void {
        nodes.forEach(node => {
            if (node instanceof VertexRenderNode) {
                node.config.outputData.forEach(vertexDataConfig => {
                    this.initializeVertexData(vertexDataConfig, nodes);
                });
            }
            if (node instanceof DrawRenderNode) {
                for (let input of node.config.input) {
                    if (input instanceof DrawRenderNodeInput.Shader) {
                        this.initializeShaderProgram(input.vertexId, input.fragmentId);
                    }
                    if (input instanceof DrawRenderNodeInput.Texture) {
                        this.initializeTexture(input.path);
                    }
                }
                for (let output of node.config.output) {
                    // noinspection SuspiciousTypeOfGuard
                    if (output instanceof DrawRenderNodeOutput.RenderTarget) {
                        this.initializeFramebuffer(output.renderTargetId);
                    }
                }
            }
        });
    }

    private initializeVertexData(config: VertexDataOutputConfig, nodes: AbstractRenderNode[]): ManagedVertexData {
        // already initialized
        if (this.vertexData.has(config.id)) {
            return this.vertexData.get(config.id)!!;
        }

        // create & initialize vertex-buffers
        const buffers = new Map<string, ManagedVertexBuffer>();
        config.attributes
            .map(att => att.origin)
            .distinct()
            .map(att => this.initializeVertexBuffer(att))
            .forEach(buffer => buffers.set(buffer.id, buffer));

        // find/create & initialize programs using this vertex-data
        const programs: ManagedProgram[] = [];
        for (const node of nodes) {
            if (node instanceof DrawRenderNode) {
                let usesData = false;
                for (let input of node.config.input) {
                    if (input instanceof DrawRenderNodeInput.VertexData) {
                        if (input.vertexDataId === config.id) {
                            usesData = true;
                        }
                    }
                }
                if (usesData) {
                    for (let input of node.config.input) {
                        if (input instanceof DrawRenderNodeInput.Shader) {
                            programs.push(this.initializeShaderProgram(input.vertexId, input.fragmentId));
                        }
                    }
                }
            }
        }

        // create vertex-arrays
        const vertexArrays = new Map<string, GLVertexArray>();
        for (const program of programs) {
            const vertexArray = GLVertexArray.create(
                this.gl,
                config.attributes.map(attribute => ({
                    buffer: buffers.get(attribute.origin)!!.buffer,
                    location: program.program.getInformation().attributes.find(a => a.name === attribute.name)!.location,
                    type: attribute.type,
                    amountComponents: attribute.amountComponents,
                    normalized: attribute.normalized,
                    stride: attribute.stride,
                    offset: attribute.offset,
                    divisor: attribute.divisor,
                })),
            );
            vertexArrays.set(program.id, vertexArray);
        }

        // register managed resource
        const managedVertexData: ManagedVertexData = {
            id: config.id,
            type: config.type,
            vertexCount: 0,
            instanceCount: 0,
            buffers: buffers,
            vertexArrays: vertexArrays,
        };
        this.vertexData.set(managedVertexData.id, managedVertexData);
        return managedVertexData;
    }

    private initializeVertexBuffer(id: string): ManagedVertexBuffer {
        if (this.vertexBuffers.has(id)) {
            return this.vertexBuffers.get(id)!;
        }
        const managedBuffer: ManagedVertexBuffer = {
            id: id,
            buffer: GLVertexBuffer.createEmpty(this.gl),
        };
        this.vertexBuffers.set(id, managedBuffer);
        return managedBuffer;
    }

    private initializeShaderProgram(vertex: string, fragment: string): ManagedProgram {
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
        return managedProgram;
    }

    private initializeTexture(path: string): ManagedTexture {
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

    private initializeFramebuffer(renderTargetId: string) {
        if (this.framebuffers.has(renderTargetId)) {
            return this.framebuffers.get(renderTargetId)!;
        }
        const managedFramebuffer: ManagedFramebuffer = {
            id: renderTargetId,
            renderTargetId: renderTargetId,
            framebuffer: GLFramebuffer.create(this.gl, 1, 1),
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

    public getTexture(pathOrRtId: string): ManagedTexture {
        const managed = this.textures.get(pathOrRtId);
        if (managed) {
            return managed;
        } else {
            throw new Error("No texture with id " + pathOrRtId + " found");
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
        buffer: GLVertexBuffer,
    }

    export interface ManagedVertexData {
        id: string,
        type: VertexDataType,
        vertexCount: number,
        instanceCount: number,
        buffers: Map<string, ManagedVertexBuffer>,
        vertexArrays: Map<string, GLVertexArray> // map from program-id program to va
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

    export interface ManagedFramebuffer {
        id: string,
        renderTargetId: string,
        framebuffer: GLFramebuffer
    }

}