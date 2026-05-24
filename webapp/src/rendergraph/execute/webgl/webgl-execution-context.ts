import {GlTexture, GLTextureMagFilter, GLTextureMinFilter, GLTextureWrap} from "@rendergraph/webgl/gl-texture.ts";
import {GlFramebuffer} from "@rendergraph/webgl/gl-framebuffer.ts";
import {GlAttributeType, GlProgram} from "@rendergraph/webgl/gl-program.ts";
import {GlVertexBuffer} from "@rendergraph/webgl/gl-vertexbuffer.ts";
import {type AttributeConfig, GlVertexArray} from "@rendergraph/webgl/gl-vertexarray.ts";
import type {
    WebGlFramebufferResource,
    WebGlProgramResource,
    WebGlResource,
    WebGlTextureResource,
    WebGlVertexArrayResource,
    WebGlVertexBufferResource,
} from "@rendergraph/execute/webgl/webgl-resource.ts";
import type {ResourceKey} from "@rendergraph/execute/resource-key.ts";
import {checkExhaustive} from "@/common/common.ts";

export type WebglExecutionContextFactory = (canvas: HTMLCanvasElement) => WebglExecutionContext

export class WebglExecutionContext {

    public static build(canvas: HTMLCanvasElement, resources: WebGlResource[]): WebglExecutionContext {
        const gl = canvas.getContext("webgl2", {alpha: false, premultipliedAlpha: true});
        if (!gl) {
            throw new Error("webgl2 is not supported!");
        }
        return new WebglExecutionContext(resources, gl);
    }

    private readonly gl: WebGL2RenderingContext;

    private readonly dirtyResources = new Set<ResourceKey>();
    private readonly resources = new Map<ResourceKey, WebGlResource>();

    private readonly textureSlots: (ResourceKey | null)[];
    private readonly texturesLocked = new Set<ResourceKey>();

    private constructor(resources: WebGlResource[], gl: WebGL2RenderingContext) {
        this.gl = gl;
        resources.forEach(resource => {
            this.resources.set(resource.key, resource);
        });
        this.loadAllResources();
        this.textureSlots = Array(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS).map(_ => null);
    }

    private loadAllResources() {

        this.resources.forEach(resource => {
            if (resource.type === "data") {
                return; // nothing to do
            }
            if (resource.type === "vertexarray") {
                return; // skip for now
            }
            if (resource.type === "texture") {
                loadTexture(this.gl, resource);
                return;
            }
            if (resource.type === "framebuffer") {
                loadFramebuffer(this.gl, resource);
                return;
            }
            if (resource.type === "program") {
                loadProgram(this.gl, resource);
                return;
            }
            if (resource.type === "vertexbuffer") {
                loadVertexBuffer(this.gl, resource);
                return;
            }
            checkExhaustive(resource);
        });

        this.resources.forEach(resource => {
            if (resource.type === "vertexarray") {
                loadVertexArray(this.gl, resource, this.resources);
                return;
            }
        });

        function loadTexture(gl: WebGL2RenderingContext, resource: WebGlTextureResource) {
            resource.resource = GlTexture.createFromPath(gl, resource.url, {
                wrap: mapTextureWrap(resource.wrap),
                filterMin: mapTextureFilterMin(resource.filterMin),
                filterMag: mapTextureFilterMag(resource.filterMag),
                flipY: true,
            });
        }

        function loadFramebuffer(gl: WebGL2RenderingContext, resource: WebGlFramebufferResource) {
            resource.resource = GlFramebuffer.create(gl, {
                width: 0,
                height: 0,
                color: true,
                depth: false,
            });
            return;
        }

        function loadProgram(gl: WebGL2RenderingContext, resource: WebGlProgramResource) {
            resource.resource = GlProgram.create(gl, resource.srcVertex, resource.srcFragment);
        }

        function loadVertexBuffer(gl: WebGL2RenderingContext, resource: WebGlVertexBufferResource) {
            resource.resource = {
                buffer: GlVertexBuffer.createEmpty(gl),
                elementCount: 0
            };
        }

        function loadVertexArray(gl: WebGL2RenderingContext, resource: WebGlVertexArrayResource, resources: Map<ResourceKey, WebGlResource>) {
            const programResource = resources.get(resource.programResourceKey) as (WebGlProgramResource | undefined);
            const program = programResource?.resource;
            if (!program) {
                throw new Error("Could not find program with key '" + resource.programResourceKey + "'");
            }
            const attributes: AttributeConfig[] = resource.attributes.map(attribute => {
                const buffer = resources.get(attribute.bufferResourceKey) as (WebGlVertexBufferResource | undefined);
                if (!buffer || !buffer.resource) {
                    throw new Error("Could not find vertex buffer with key '" + attribute.bufferResourceKey + "'");
                }
                const programAttributeInfo = program.getInformation().attributes
                    .find(it => it.name === programResource.prefixVertexAttributes + attribute.name);
                if (!programAttributeInfo && attribute.type !== GlAttributeType.PADDING) {
                    throw new Error("Could not find attribute info '" + attribute.name + "' in program '" + resource.programResourceKey + "'");
                }
                return {
                    buffer: buffer.resource.buffer,
                    location: attribute.type === GlAttributeType.PADDING ? -1 : (programAttributeInfo?.location ?? -1),
                    type: attribute.type,
                    amountComponents: attribute.amountComponents,
                    normalized: attribute.normalized,
                    stride: undefined,
                    offset: undefined,
                    divisor: attribute.divisor,
                    debugName: programResource.prefixVertexAttributes + attribute.name,
                };
            });
            resource.resource = GlVertexArray.create(gl, attributes, undefined);
        }

        function mapTextureWrap(wrap: "repeat" | "clamp-to-edge" | "mirrored-repeat"): GLTextureWrap {
            switch (wrap) {
                case "repeat":
                    return GLTextureWrap.REPEAT;
                case "clamp-to-edge":
                    return GLTextureWrap.CLAMP_TO_EDGE;
                case "mirrored-repeat":
                    return GLTextureWrap.MIRRORED_REPEAT;
                default:
                    checkExhaustive(wrap);
            }
        }

        function mapTextureFilterMin(filter: "linear" | "nearest" | "nearest-mipmap-nearest" | "linear-mipmap-nearest" | "nearest-mipmap-linear" | "linear-mipmap-linear"): GLTextureMinFilter {
            switch (filter) {
                case "linear":
                    return GLTextureMinFilter.LINEAR;
                case "nearest":
                    return GLTextureMinFilter.NEAREST;
                case "nearest-mipmap-nearest":
                    return GLTextureMinFilter.NEAREST_MIPMAP_NEAREST;
                case "linear-mipmap-nearest":
                    return GLTextureMinFilter.LINEAR_MIPMAP_NEAREST;
                case "nearest-mipmap-linear":
                    return GLTextureMinFilter.NEAREST_MIPMAP_LINEAR;
                case "linear-mipmap-linear":
                    return GLTextureMinFilter.LINEAR_MIPMAP_LINEAR;
                default:
                    checkExhaustive(filter);
            }
        }

        function mapTextureFilterMag(filter: "linear" | "nearest"): GLTextureMagFilter {
            switch (filter) {
                case "linear":
                    return GLTextureMagFilter.LINEAR;
                case "nearest":
                    return GLTextureMagFilter.NEAREST;
                default:
                    checkExhaustive(filter);
            }
        }

    }

    getGlContext(): WebGL2RenderingContext {
        return this.gl;
    }

    getTexture(resourceKey: ResourceKey): GlTexture {
        const resource = this.resources.get(resourceKey);
        if (!resource || resource.type !== "texture" || !resource.resource) {
            throw new Error("Resource (texture) with key '" + resourceKey + "' is not known.");
        }
        return resource.resource;
    }

    getProgram(resourceKey: ResourceKey): GlProgram {
        const resource = this.resources.get(resourceKey);
        if (!resource || resource.type !== "program" || !resource.resource) {
            throw new Error("Resource (program) with key '" + resourceKey + "' is not known.");
        }
        return resource.resource;
    }

    getFramebuffer(resourceKey: ResourceKey): GlFramebuffer {
        const resource = this.resources.get(resourceKey);
        if (!resource || resource.type !== "framebuffer" || !resource.resource) {
            throw new Error("Resource (framebuffer) with key '" + resourceKey + "' is not known.");
        }
        return resource.resource;
    }

    getVertexBuffer(resourceKey: ResourceKey): GlVertexBuffer {
        const resource = this.resources.get(resourceKey);
        if (!resource || resource.type !== "vertexbuffer" || !resource.resource) {
            throw new Error("Resource (vertex buffer) with key '" + resourceKey + "' is not known.");
        }
        return resource.resource.buffer;
    }

    getVertexBufferElementCount(resourceKey: ResourceKey): number {
        const resource = this.resources.get(resourceKey);
        if (!resource || resource.type !== "vertexbuffer" || !resource.resource) {
            throw new Error("Resource (vertex buffer) with key '" + resourceKey + "' is not known.");
        }
        return resource.resource.elementCount;
    }

    setVertexBufferElementCount(resourceKey: ResourceKey, count: number) {
        const resource = this.resources.get(resourceKey);
        if (!resource || resource.type !== "vertexbuffer" || !resource.resource) {
            throw new Error("Resource (vertex buffer) with key '" + resourceKey + "' is not known.");
        }
        resource.resource.elementCount = count;
    }

    getVertexArray(resourceKey: ResourceKey): GlVertexArray {
        const resource = this.resources.get(resourceKey);
        if (!resource || resource.type !== "vertexarray" || !resource.resource) {
            throw new Error("Resource (vertex array) with key '" + resourceKey + "' is not known.");
        }
        return resource.resource;
    }

    setData(resourceKey: ResourceKey, data: unknown): void {
        const resource = this.resources.get(resourceKey);
        if (!resource || resource.type !== "data") {
            throw new Error("Resource (data) with key '" + resourceKey + "' is not known.");
        }
        resource.resource = data;
    }

    getData(resourceKey: ResourceKey): unknown {
        const resource = this.resources.get(resourceKey);
        if (!resource || resource.type !== "data") {
            throw new Error("Resource (data) with key '" + resourceKey + "' is not known.");
        }
        return resource.resource;
    }

    clearAllDirty(): void {
        this.dirtyResources.clear();
    }

    isDirty(resourceKey: ResourceKey): boolean {
        return this.dirtyResources.has(resourceKey);
    }

    setDirty(resourceKey: ResourceKey): void {
        this.dirtyResources.add(resourceKey);
    }

    lockTextures(resourceKeys: ResourceKey[]): void {
        this.texturesLocked.clear();
        resourceKeys.forEach(it => this.texturesLocked.add(it));
    }

    reserveTextureUnit(resourceKey: ResourceKey): number {

        // find unit if already used
        for (let i = 0; i < this.textureSlots.length; i++) {
            if (this.textureSlots[i] === resourceKey) {
                return i;
            }
        }
        // find empty unit
        for (let i = 0; i < this.textureSlots.length; i++) {
            if (this.textureSlots[i] === null) {
                return i;
            }
        }

        // find slot to overwrite
        for (let i = 0; i < this.textureSlots.length; i++) {
            const key = this.textureSlots[i];
            if (key && !this.texturesLocked.has(key)) {
                return i;
            }
        }

        throw new Error("Could not find free texture unit for '" + resourceKey + "'"); // todo
    }

}