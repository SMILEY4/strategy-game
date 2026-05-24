import type {GlTexture} from "@rendergraph/webgl/gl-texture.ts";
import type {GlFramebuffer} from "@rendergraph/webgl/gl-framebuffer.ts";
import {type GlAttributeComponentAmount, GlAttributeType, type GlProgram} from "@rendergraph/webgl/gl-program.ts";
import type {GlVertexBuffer} from "@rendergraph/webgl/gl-vertexbuffer.ts";
import type {GlVertexArray} from "@rendergraph/webgl/gl-vertexarray.ts";
import type {ResourceKey} from "@rendergraph/execute/resource-key.ts";

export type WebGlResource =
    | WebGlDataResource
    | WebGlTextureResource
    | WebGlFramebufferResource
    | WebGlProgramResource
    | WebGlVertexBufferResource
    | WebGlVertexArrayResource


export interface WebglResourceBase<TypeIdentifier extends string> {
    readonly type: TypeIdentifier,
    readonly key: ResourceKey,
}

export interface WebGlDataResource extends WebglResourceBase<"data"> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resource: any
}

export interface WebGlTextureResource extends WebglResourceBase<"texture"> {
    readonly url: string,
    readonly wrap: "repeat" | "clamp-to-edge" | "mirrored-repeat",
    readonly filterMin: "linear" | "nearest" | "nearest-mipmap-nearest" | "linear-mipmap-nearest" | "nearest-mipmap-linear" | "linear-mipmap-linear",
    readonly filterMag: "linear" | "nearest"
    resource: GlTexture | null,
}

export interface WebGlFramebufferResource extends WebglResourceBase<"framebuffer"> {
    readonly size: { width: number, height: number } | "auto"
    readonly color: boolean
    readonly depth: boolean
    resource: GlFramebuffer | null;
}

export interface WebGlProgramResource extends WebglResourceBase<"program"> {
    readonly srcVertex: string,
    readonly srcFragment: string,
    readonly prefixVertexAttributes: string,
    readonly prefixUniforms: string,
    resource: GlProgram | null
}

export interface WebGlVertexBufferResource extends WebglResourceBase<"vertexbuffer"> {
    resource: { buffer: GlVertexBuffer, elementCount: number } | null;
}

/**
 * NOTE: vertex arrays have a 1:1 relation to a shader program (with "location")
 * -> geometry nodes can not be shared with webgl (maybe: detect and split/duplicate geo-nodes)
 */
export interface WebGlVertexArrayResource extends WebglResourceBase<"vertexarray"> {
    readonly attributes: ({
        bufferResourceKey: ResourceKey,
        name: string,
        type: GlAttributeType
        amountComponents: GlAttributeComponentAmount
        normalized: boolean | undefined
        divisor: number
    })[]
    readonly programResourceKey: ResourceKey
    resource: GlVertexArray | null;
}