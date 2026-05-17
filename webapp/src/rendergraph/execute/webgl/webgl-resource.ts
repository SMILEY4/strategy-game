import type {GlTexture} from "@rendergraph/webgl/gl-texture.ts";
import type {GlFramebuffer} from "@rendergraph/webgl/gl-framebuffer.ts";
import {type GlAttributeComponentAmount, GlAttributeType, type GlProgram} from "@rendergraph/webgl/gl-program.ts";
import type {GlVertexBuffer} from "@rendergraph/webgl/gl-vertexbuffer.ts";
import type {GlVertexArray} from "@rendergraph/webgl/gl-vertexarray.ts";
import type {ResourceKey} from "@rendergraph/execute/webgl/webgl-execution-context.ts";

export type WebGlResource =
    | WebGlDataResource
    | WebGlTextureResource
    | WebGlFramebufferResource
    | WebGlShaderProgramResource
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

export interface WebGlShaderProgramResource extends WebglResourceBase<"program"> {
    readonly srcVertex: string,
    readonly srcFragment: string,
    resource: GlProgram | null
}

export interface WebGlVertexBufferResource extends WebglResourceBase<"vertexbuffer"> {
    resource: GlVertexBuffer | null;
}

export interface WebGlVertexArrayResource extends WebglResourceBase<"vertexarray"> {
    readonly attributes: ({
        bufferResourceKey: ResourceKey,
        name: string,
        type: GlAttributeType
        amountComponents: GlAttributeComponentAmount
        normalized: boolean | undefined
        stride: number | undefined
        offset: number | undefined
        divisor: number | undefined
    })[]
    resource: GlVertexArray | null;
}