import type {GlDisposable} from "@modules/rendergraph/webgl/gl-disposable.ts";
import {GlError} from "@modules/rendergraph/webgl/gl-error.ts";

export interface GlTextureAttachmentFormat {
    isColor: () => boolean;
    isDepth: () => boolean;
    getId: () => GLint;
}

export class GLColorStoreFormat implements GlTextureAttachmentFormat {
    public static readonly RGBA_8 = new GLColorStoreFormat(WebGL2RenderingContext.RGBA8);
    public static readonly RGB_8 = new GLColorStoreFormat(WebGL2RenderingContext.RGB8);
    public static readonly RGBA_16F = new GLColorStoreFormat(WebGL2RenderingContext.RGBA16F);
    public static readonly RGBA_32F = new GLColorStoreFormat(WebGL2RenderingContext.RGBA32F);
    public static readonly R_8 = new GLColorStoreFormat(WebGL2RenderingContext.R8);
    public static readonly R_16F = new GLColorStoreFormat(WebGL2RenderingContext.R16F);
    public static readonly R_32F = new GLColorStoreFormat(WebGL2RenderingContext.R32F);

    readonly id: GLint;

    private constructor(id: GLint) {
        this.id = id;
    }

    public isColor() {
        return true;
    }

    public isDepth() {
        return false;
    }

    public getId() {
        return this.id;
    }

}

export class GLDepthStoreFormat implements GlTextureAttachmentFormat {
    public static readonly DEPTH_COMPONENT24 = new GLDepthStoreFormat(WebGL2RenderingContext.DEPTH_COMPONENT24);
    public static readonly DEPTH_COMPONENT32F = new GLDepthStoreFormat(WebGL2RenderingContext.DEPTH_COMPONENT32F);
    public static readonly DEPTH24_STENCIL8 = new GLDepthStoreFormat(WebGL2RenderingContext.DEPTH24_STENCIL8);

    readonly id: GLint;

    private constructor(id: GLint) {
        this.id = id;
    }

    public isColor() {
        return false;
    }

    public isDepth() {
        return true;
    }

    public getId() {
        return this.id;
    }
}

export class GLTextureAttachment implements GlDisposable {

    public static create(gl: WebGL2RenderingContext, width: number, height: number, format: GlTextureAttachmentFormat): GLTextureAttachment {

        const handle = gl.createTexture();
        GlError.check(gl, "createTexture", "creating framebuffer attachment");
        if (!handle) {
            throw new Error("Could not create framebuffer attachment");
        }

        gl.bindTexture(gl.TEXTURE_2D, handle);
        GlError.check(gl, "bindTexture", "binding framebuffer attachment");

        GLTextureAttachment.allocateStorage(gl, width, height, format)

        return new GLTextureAttachment(gl, width, height, format, handle);
    }

    private static allocateStorage(gl: WebGL2RenderingContext, width: number, height: number, format: GlTextureAttachmentFormat) {
        const filter = format.isDepth() ? gl.NEAREST : gl.LINEAR;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        GlError.check(gl, "texParameteri", "setting parameters of framebuffer attachment");

        gl.texStorage2D(gl.TEXTURE_2D, 1, format.getId(), width, height);
        GlError.check(gl, "texStorage2D", "allocating attachment storage");
    }

    private readonly gl: WebGL2RenderingContext;
    private readonly format: GlTextureAttachmentFormat;
    private handle: WebGLTexture;
    private width: number;
    private height: number;

    private constructor(
        gl: WebGL2RenderingContext,
        width: number,
        height: number,
        format: GlTextureAttachmentFormat,
        handle: WebGLTexture
    ) {
        this.gl = gl;
        this.format = format;
        this.width = width;
        this.height = height;
        this.handle = handle;
    }

    public getFormat() {
        return this.format
    }

    public getHandle() {
        return this.handle
    }

    public getSize(): [number, number] {
        return [this.width, this.height];
    }

    public resize(width: number, height: number) {
        if (this.width === width && this.height === height) return;

        this.gl.deleteTexture(this.handle);
        const newHandle = this.gl.createTexture();
        if (!newHandle) throw new Error("Failed to re-allocate texture handle");

        this.gl.bindTexture(this.gl.TEXTURE_2D, newHandle);
        GlError.check(this.gl, "bindTexture", "binding framebuffer attachment");

        GLTextureAttachment.allocateStorage(this.gl, width, height, this.format)

        this.handle = newHandle;
        this.width = width;
        this.height = height;
    }

    public dispose(): void {
        this.gl.deleteTexture(this.handle);
        GlError.check(this.gl, "deleteTexture", "disposing attachment texture");
    }

}