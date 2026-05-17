import  {type GlTexture} from "@rendergraph/webgl/gl-texture.ts";
import  {type GlFramebuffer} from "@rendergraph/webgl/gl-framebuffer.ts";
import type {GlProgram} from "@rendergraph/webgl/gl-program.ts";
import type {GlVertexBuffer} from "@rendergraph/webgl/gl-vertexbuffer.ts";
import type {GlVertexArray} from "@rendergraph/webgl/gl-vertexarray.ts";
import type {WebGlResource} from "@rendergraph/execute/webgl/webgl-resource.ts";

export type ResourceKey = string

export interface WebglExecutionContext {

    registerResource(resource: WebGlResource): void

    getGlContext(): WebGL2RenderingContext
    getTexture(resourceKey: ResourceKey): GlTexture
    getProgram(resourceKey: ResourceKey): GlProgram
    getFramebuffer(resourceKey: ResourceKey): GlFramebuffer
    getVertexBuffer(resourceKey: ResourceKey): GlVertexBuffer
    getVertexArray(resourceKey: ResourceKey): GlVertexArray

    setData(resourceKey: ResourceKey, data: unknown): void
    getData(resourceKey: ResourceKey): unknown

    isDirty(resourceKey: ResourceKey): boolean
    setDirty(resourceKey: ResourceKey): boolean

    reserveTextureUnit(resourceKey: ResourceKey): number
}
