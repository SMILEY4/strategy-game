import {ResourceManager} from "../compiler/resourceManager";
import {RenderContext} from "../context/renderContext";
import {RenderNodeResourceEntry} from "../nodes/abstractRenderNode";
import {GLFramebuffer} from "../../../shared/webgl/glFramebuffer";
import {GLTexture, GLTextureMinFilter} from "../../../shared/webgl/glTexture";
import {GLProgram} from "../../../shared/webgl/glProgram";
import {RenderTargetConfig} from "../resources/renderTargetRenderResource";
import {TextureConfig} from "../resources/textureRenderResource";
import {VertexDataConfig} from "../resources/vertexDataRenderResource";
import {ShaderConfig} from "../resources/shaderRenderResource";
import {WebglVertexDataResource} from "./webglVertexDataResource";
import {BaseRenderer} from "../../../shared/webgl/baseRenderer";
import {WebGlVertexDataGenerator} from "./webglVertexDataGenerator";

export interface WebGlResourceManagerConfig {
    shaderSources: ({
        name: string,
        source: string
    })[];
    vertexData: ({
        name: string,
        generator: WebGlVertexDataGenerator,
    })[];
}

export class WebGlResourceManager implements ResourceManager, RenderContext {

    private readonly gl: WebGL2RenderingContext;
    private readonly renderer: BaseRenderer;
    private readonly config: WebGlResourceManagerConfig;

    private readonly framebuffers = new Map<string, GLFramebuffer>();
    private readonly textures = new Map<string, GLTexture>();
    private readonly vertexData = new Map<string, WebglVertexDataResource>();
    private readonly programs = new Map<string, GLProgram>();

    constructor(gl: WebGL2RenderingContext, config: WebGlResourceManagerConfig) {
        this.gl = gl;
        this.renderer = new BaseRenderer(gl);
        this.config = config;
    }

    public initialize(declaredResources: RenderNodeResourceEntry[]): void {
        for (let resource of declaredResources) {
            switch (resource.type) {
                case "render-target": {
                    const config = resource as RenderTargetConfig;
                    const framebuffer = GLFramebuffer.create(this.gl, 1, 1);
                    this.framebuffers.set(config.name, framebuffer);
                    break;
                }
                case "texture": {
                    const config = resource as TextureConfig;
                    const texture = GLTexture.createFromPath(this.gl, "/groundSplotches.png", {filterMin: GLTextureMinFilter.NEAREST});
                    this.textures.set(config.path, texture);
                    break;
                }
                case "shader": {
                    const config = resource as ShaderConfig;
                    const srcVertex = this.config.shaderSources.find(e => e.name === config.vertex);
                    const srcFragment = this.config.shaderSources.find(e => e.name === config.fragment);
                    if (!srcVertex || !srcFragment) {
                        throw new Error("Missing source for vertex shader " + config.vertex + "or fragment shader " + config.fragment);
                    }
                    const program = GLProgram.create(this.gl, srcVertex.source, srcFragment.source);
                    this.programs.set(config.fragment + "-" + config.vertex, program);
                    break;
                }
                case "vertexdata": {
                    const config = resource as VertexDataConfig;
                    const resourceConfig = this.config.vertexData.find(e => e.name === config.name);
                    if (!resourceConfig) {
                        throw new Error("Missing config for vertex data with name " + config.name);
                    }
                    const data = resourceConfig.generator.create({
                        gl: this.gl,
                        shader: null as any // todo: what shader to use -> can this/binding be decided later ??
                    })
                    this.vertexData.set(config.name, data)
                    break;
                }
            }
        }
    }

    public dispose(): void {
        for (let framebuffer of this.framebuffers.values()) {
            framebuffer.dispose();
        }
        for (let texture of this.textures.values()) {
            texture.dispose();
        }
        for (let vertexArray of this.vertexData.values()) {
            vertexArray.dispose();
        }
        for (let program of this.programs.values()) {
            program.dispose();
        }
        this.framebuffers.clear();
        this.textures.clear();
        this.vertexData.clear();
        this.programs.clear();
    }

    public getFramebuffer(name: string): GLFramebuffer {
        const framebuffer = this.framebuffers.get(name);
        if (framebuffer === undefined) {
            throw new Error("No framebuffer with name " + name + " found.");
        }
        return framebuffer;
    }

    public getTexture(name: string): GLTexture {
        const texture = this.textures.get(name);
        if (texture === undefined) {
            throw new Error("No texture with name " + name + " found.");
        }
        return texture;
    }

    public getVertexData(name: string): WebglVertexDataResource {
        const vertexData = this.vertexData.get(name);
        if (vertexData === undefined) {
            throw new Error("No vertex data with name " + name + " found.");
        }
        return vertexData;
    }

    public getProgram(name: string): GLProgram {
        const program = this.programs.get(name);
        if (program === undefined) {
            throw new Error("No program array with name " + name + " found.");
        }
        return program;
    }

    public getRenderer(): BaseRenderer {
        return this.renderer;
    }

}