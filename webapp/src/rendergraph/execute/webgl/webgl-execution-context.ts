import {GlAttributeType, GlProgram} from "@rendergraph/webgl/gl-program.ts";
import {GlFramebuffer} from "@rendergraph/webgl/gl-framebuffer.ts";
import {GlVertexBuffer} from "@rendergraph/webgl/gl-vertexbuffer.ts";
import {type AttributeConfig, GlVertexArray} from "@rendergraph/webgl/gl-vertexarray.ts";
import {GlTexture, GLTextureMagFilter, GLTextureMinFilter, GLTextureWrap} from "@rendergraph/webgl/gl-texture.ts";
import type {
    WebGlFramebufferResource,
    WebGlProgramResource,
    WebGlResource,
    WebGlTextureResource,
    WebGlVertexArrayResource,
    WebGlVertexBufferResource,
} from "@rendergraph/execute/webgl/webgl-resource.ts";
import {assertExhaustive} from "@/common/common.ts";

export type WebglExecutionContextFactory = (canvas: HTMLCanvasElement) => WebGlExecutionContext


export class WebGlExecutionContext {

    public static build(canvas: HTMLCanvasElement, resources: WebGlResource[]): WebGlExecutionContext {
        const gl = canvas.getContext("webgl2", {alpha: false, premultipliedAlpha: true});
        if (!gl) {
            throw new Error("webgl2 is not supported!");
        }
        return new WebGlExecutionContext(resources, gl);
    }

    private readonly gl: WebGL2RenderingContext;
    private readonly resources = new Map<string, WebGlResource>;
    private readonly dirtyResources = new Set<string>();
    private readonly initializedResources = new Set<string>();

    constructor(resources: WebGlResource[], gl: WebGL2RenderingContext) {
        this.gl = gl;

        console.log("Creating webgl execution context with resources: ", resources.map(it => ({type: it.type, id: it.key})));

        resources.forEach(resource => {
            this.resources.set(resource.key, resource);
        });
        this.loadAllResources();
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
            assertExhaustive(resource);
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
                elementCount: 0,
            };
        }

        function loadVertexArray(gl: WebGL2RenderingContext, resource: WebGlVertexArrayResource, resources: Map<string, WebGlResource>) {
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
                    .find(it => it.name === attribute.name);
                if (!programAttributeInfo && attribute.type !== GlAttributeType.PADDING) {
                    console.warn("Could not find attribute info '" + attribute.name + "' in program '" + resource.programResourceKey + "'")
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
                    debugName: attribute.name,
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
                    assertExhaustive(wrap);
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
                    assertExhaustive(filter);
            }
        }

        function mapTextureFilterMag(filter: "linear" | "nearest"): GLTextureMagFilter {
            switch (filter) {
                case "linear":
                    return GLTextureMagFilter.LINEAR;
                case "nearest":
                    return GLTextureMagFilter.NEAREST;
                default:
                    assertExhaustive(filter);
            }
        }

    }

    dispose() {
        this.resources.forEach(resource => {
            if (resource.type === "data") {
                return; // nothing to do
            }
            if (resource.type === "vertexarray") {
                resource.resource?.dispose();
                resource.resource = null;
                return;
            }
            if (resource.type === "texture") {
                resource.resource?.dispose();
                resource.resource = null;
                return;
            }
            if (resource.type === "framebuffer") {
                resource.resource?.dispose();
                resource.resource = null;
                return;
            }
            if (resource.type === "program") {
                resource.resource?.dispose();
                resource.resource = null;
                return;
            }
            if (resource.type === "vertexbuffer") {
                resource.resource?.buffer.dispose();
                resource.resource = null;
                return;
            }
            assertExhaustive(resource);
        });
    }

    getRenderingContext(): WebGL2RenderingContext {
        return this.gl;
    }

    getProgram(id: string): GlProgram {
        const resource = this.resources.get(id);
        if (!resource || resource.type !== "program" || !resource.resource) {
            throw new Error("Resource (program) with key '" + id + "' is not known.");
        }
        return resource.resource;
    }

    getFramebuffer(id: string): GlFramebuffer {
        const resource = this.resources.get(id);
        if (!resource || resource.type !== "framebuffer" || !resource.resource) {
            throw new Error("Resource (framebuffer) with key '" + id + "' is not known.");
        }
        return resource.resource;
    }

    getVertexBuffer(id: string): GlVertexBuffer {
        const resource = this.resources.get(id);
        if (!resource || resource.type !== "vertexbuffer" || !resource.resource) {
            throw new Error("Resource (vertex buffer) with key '" + id + "' is not known.");
        }
        return resource.resource.buffer;
    }

    getVertexBufferElementCount(id: string): number {
        const resource = this.resources.get(id);
        if (!resource || resource.type !== "vertexbuffer" || !resource.resource) {
            throw new Error("Resource (vertex buffer) with key '" + id + "' is not known.");
        }
        return resource.resource.elementCount;
    }

    setVertexBufferElementCount(id: string, count: number): void {
        const resource = this.resources.get(id);
        if (!resource || resource.type !== "vertexbuffer" || !resource.resource) {
            throw new Error("Resource (vertex buffer) with key '" + id + "' is not known.");
        }
        this.setInitialized(id)
        resource.resource.elementCount = count;
    }

    getVertexArray(id: string): GlVertexArray {
        const resource = this.resources.get(id);
        if (!resource || resource.type !== "vertexarray" || !resource.resource) {
            throw new Error("Resource (vertex array) with key '" + id + "' is not known.");
        }
        return resource.resource;
    }

    getTexture(id: string): GlTexture {
        const resource = this.resources.get(id);
        if (!resource || resource.type !== "texture" || !resource.resource) {
            throw new Error("Resource (texture) with key '" + id + "' is not known.");
        }
        return resource.resource;
    }

    getData<T>(id: string): T {
        const resource = this.resources.get(id);
        if (!resource || resource.type !== "data") {
            throw new Error("Resource (data) with key '" + id + "' is not known.");
        }
        return resource.resource as T;
    }

    setData(id: string, value: unknown): void {
        const resource = this.resources.get(id);
        if (!resource || resource.type !== "data") {
            throw new Error("Resource (data) with key '" + id + "' is not known.");
        }
        this.setInitialized(id)
        resource.resource = value;
    }

    isDirty(id: string): boolean {
        return this.dirtyResources.has(id);
    }

    setDirty(id: string): void {
        this.dirtyResources.add(id);
    }

    setAllDirty(dirty: boolean): void {
        if (dirty) {
            this.resources.forEach(resource => this.dirtyResources.add(resource.key));
        } else {
            this.dirtyResources.clear();
        }
    }

    isInitialized(id: string): boolean {
        return this.initializedResources.has(id);
    }

    setInitialized(id: string): void {
        this.initializedResources.add(id);
    }

    getResources(): WebGlResource[] {
        return Array.from(this.resources.values())
    }

}