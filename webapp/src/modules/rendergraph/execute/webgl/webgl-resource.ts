import type {GlTexture} from "@modules/rendergraph/webgl/gl-texture.ts";
import GlFramebuffer from "@modules/rendergraph/webgl/gl-framebuffer.ts";
import {type GlAttributeComponentAmount, GlAttributeType, type GlProgram} from "@modules/rendergraph/webgl/gl-program.ts";
import type {GlVertexBuffer} from "@modules/rendergraph/webgl/gl-vertexbuffer.ts";
import type {GlVertexArray} from "@modules/rendergraph/webgl/gl-vertexarray.ts";
import type {RendertargetAttachment} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";

export type WebGlResource =
    | WebGlDataResource
    | WebGlTextureResource
    | WebGlFramebufferResource
    | WebGlProgramResource
    | WebGlVertexBufferResource
    | WebGlVertexArrayResource


export interface WebglResourceBase<TypeIdentifier extends string> {
    readonly type: TypeIdentifier,
    readonly key: string,
}

export interface WebGlDataResource extends WebglResourceBase<"data"> {
    resource: unknown
}

export interface WebGlTextureResource extends WebglResourceBase<"texture"> {
    readonly url: string,
    readonly wrap: "repeat" | "clamp-to-edge" | "mirrored-repeat",
    readonly filterMin: "linear" | "nearest" | "nearest-mipmap-nearest" | "linear-mipmap-nearest" | "nearest-mipmap-linear" | "linear-mipmap-linear",
    readonly filterMag: "linear" | "nearest"
    resource: GlTexture | null,
}

export interface WebGlFramebufferResource extends WebglResourceBase<"framebuffer"> {
    readonly initialSize: [number, number]
    readonly attachments: Record<string, RendertargetAttachment>,
    resource: GlFramebuffer | null;
}

export interface WebGlProgramResource extends WebglResourceBase<"program"> {
    readonly srcVertex: string,
    readonly srcFragment: string,
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
    readonly attributes: WebGlVertexArrayAttributeResource[]
    readonly programResourceKey: string
    resource: GlVertexArray | null;
}

export  interface WebGlVertexArrayAttributeResource {
    bufferResourceKey: string,
    name: string,
    type: GlAttributeType
    amountComponents: GlAttributeComponentAmount
    normalized: boolean | undefined
    divisor: number
}