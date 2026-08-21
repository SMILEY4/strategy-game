import {GlError} from "./gl-error.ts";
import type {GlDisposable} from "@modules/rendergraph/webgl/gl-disposable.ts";

export type GLFramebufferConfig = {
    width: number,
    height: number,
    attachments: GLFramebufferAttachmentConfig[]
}

export type GLFramebufferAttachmentConfig = GLFramebufferColorAttachmentConfig | GLFramebufferDepthAttachmentConfig

type GLFramebufferColorAttachmentConfig = {
    type: "color",
    name: string,
    format: GLColorStoreFormat
}

type GLFramebufferDepthAttachmentConfig = {
    type: "depth",
    name: string,
    format: GLDepthStoreFormat
}

export class GLColorStoreFormat {
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
}

export class GLDepthStoreFormat {
    public static readonly DEPTH_COMPONENT24 = new GLDepthStoreFormat(WebGL2RenderingContext.DEPTH_COMPONENT24);
    public static readonly DEPTH_COMPONENT32F = new GLDepthStoreFormat(WebGL2RenderingContext.DEPTH_COMPONENT32F);
    public static readonly DEPTH24_STENCIL8 = new GLDepthStoreFormat(WebGL2RenderingContext.DEPTH24_STENCIL8);

    readonly id: GLint;

    private constructor(id: GLint) {
        this.id = id;
    }
}

type GLFramebufferAttachment = GLFramebufferColorAttachment | GLFramebufferDepthAttachment

interface GLFramebufferColorAttachment {
    type: "color"
    config: GLFramebufferColorAttachmentConfig
    handle: WebGLTexture,
    attachmentSlot: number
}

interface GLFramebufferDepthAttachment {
    type: "depth"
    config: GLFramebufferDepthAttachmentConfig
    handle: WebGLTexture,
}

/**
 * A webgl framebuffer handle to render to
 */
class GlFramebuffer implements GlDisposable {

    /**
     * Unbind any currently bound framebuffer
     * @param gl the webgl context
     */
    public static unbind(gl: WebGL2RenderingContext) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        GlError.check(gl, "bindFramebuffer", "unbinding framebuffer");
    }

    /**
     * Create a new framebuffer
     * @param gl the webgl context
     * @param config the configuration of the framebuffer
     */
    public static create(gl: WebGL2RenderingContext, config: GLFramebufferConfig) {
        const { width, height, attachments } = config;

        if (attachments.filter(it => it.type === "depth").length > 1) {
            throw new Error("Could not create framebuffer: too many depth attachments defined");
        }

        const fb = gl.createFramebuffer();
        GlError.check(gl, "createFramebuffer", "creating framebuffer");
        if (!fb) {
            throw new Error("Could not create framebuffer");
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        GlError.check(gl, "bindFramebuffer", "binding framebuffer");

        const fbAttachments: GLFramebufferAttachment[] = [];

        let colorAttachmentSlot = 0;
        attachments.forEach(attachment => {
            const textureHandle = gl.createTexture();
            GlError.check(gl, "createTexture", "creating framebuffer attachment");
            if (!textureHandle) {
                throw new Error("Could not create framebuffer attachment");
            }

            gl.bindTexture(gl.TEXTURE_2D, textureHandle);
            GlError.check(gl, "bindTexture", "binding framebuffer attachment");

            const filter = attachment.type === "depth" ? gl.NEAREST : gl.LINEAR;
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            GlError.check(gl, "texParameteri", "setting parameters of framebuffer attachment");

            gl.texStorage2D(gl.TEXTURE_2D, 1, attachment.format.id, width, height);
            GlError.check(gl, "texStorage2D", "reserving memory for framebuffer attachment");

            const attachmentPoint = attachment.type === "depth"
                ? (attachment.format.id === WebGL2RenderingContext.DEPTH24_STENCIL8
                    ? gl.DEPTH_STENCIL_ATTACHMENT
                    : gl.DEPTH_ATTACHMENT)
                : gl.COLOR_ATTACHMENT0 + colorAttachmentSlot;

            gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, textureHandle, 0);

            if (attachment.type === "color") {
                fbAttachments.push({
                    type: "color",
                    config: attachment as GLFramebufferColorAttachmentConfig,
                    handle: textureHandle,
                    attachmentSlot: colorAttachmentSlot,
                });
                colorAttachmentSlot++;
            } else {
                fbAttachments.push({
                    type: "depth",
                    config: attachment as GLFramebufferDepthAttachmentConfig,
                    handle: textureHandle,
                });
            }
        });

        // Enable drawBuffers whenever there is 1 or more color buffers
        const drawBuffers: GLenum[] = fbAttachments
            .filter((att): att is GLFramebufferColorAttachment => att.type === "color")
            .map(att => gl.COLOR_ATTACHMENT0 + att.attachmentSlot);

        if (drawBuffers.length > 0) {
            gl.drawBuffers(drawBuffers);
            GlError.check(gl, "drawBuffers", "set target color buffers");
        } else {
            gl.drawBuffers([gl.NONE]);
        }

        // Check status
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error(`Framebuffer incomplete: ${status}`);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        GlError.check(gl, "bindFramebuffer", "unbinding framebuffer");

        return new GlFramebuffer(gl, width, height, fb, fbAttachments);
    }

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLFramebuffer;
    private readonly attachments: GLFramebufferAttachment[];
    private readonly attachmentMapping = new Map<string, number>();
    private width: number;
    private height: number;

    private constructor(
        gl: WebGL2RenderingContext,
        width: number,
        height: number,
        handle: WebGLFramebuffer,
        attachments: GLFramebufferAttachment[],
    ) {
        this.gl = gl;
        this.handle = handle;
        this.width = width;
        this.height = height;
        this.attachments = attachments;
        attachments.forEach((attachment, index) => {
            this.attachmentMapping.set(attachment.config.name, index);
        });
    }

    /**
     * Ensures this framebuffer has the given size and resizes if necessary
     * @param width the new width in pixels
     * @param height the new height in pixels
     * @param bind to bind the framebuffer. Leave or set false when already bound before calling this function.
     */
    public resize(width: number, height: number, bind?: boolean) {
        if (width === this.width && height === this.height) {
            return;
        }

        if (bind) {
            this.bind();
        }

        this.attachments.forEach(attachment => {
            // Delete old immutable texture handle
            this.gl.deleteTexture(attachment.handle);

            // Re-create new texture handle
            const newTexture = this.gl.createTexture();
            if (!newTexture) {
                throw new Error("Failed to re-allocate texture during framebuffer resize");
            }

            const filter = attachment.type === "depth" ? this.gl.NEAREST : this.gl.LINEAR;
            this.gl.bindTexture(this.gl.TEXTURE_2D, newTexture);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, filter);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, filter);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

            // Allocate fresh immutable storage with new dimensions
            this.gl.texStorage2D(this.gl.TEXTURE_2D, 1, attachment.config.format.id, width, height);

            const attachmentPoint = attachment.type === "depth"
                ? (attachment.config.format.id === WebGL2RenderingContext.DEPTH24_STENCIL8
                    ? this.gl.DEPTH_STENCIL_ATTACHMENT
                    : this.gl.DEPTH_ATTACHMENT)
                : this.gl.COLOR_ATTACHMENT0 + attachment.attachmentSlot;

            // Re-attach to FBO
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachmentPoint, this.gl.TEXTURE_2D, newTexture, 0);

            // Update local object reference
            attachment.handle = newTexture;
        });

        // check status
        const status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
        if (status !== this.gl.FRAMEBUFFER_COMPLETE) {
            throw new Error(`Framebuffer incomplete after resize: ${status}`);
        }

        this.width = width;
        this.height = height;
    }

    /**
     * Bind this framebuffer, making this the current render target
     */
    public bind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.handle);
        GlError.check(this.gl, "bindFramebuffer", "binding framebuffer");
    }

    /**
     * Bind an attachment (color or depth) of this framebuffer as a texture to the given texture unit
     * @param attachmentName the name of the attachment to bind as a texture
     * @param textureUnit the target texture unit
     */
    public bindTexture(attachmentName: string, textureUnit: number) {
        const attachment = this.attachments[this.attachmentMapping.get(attachmentName) ?? -1];
        if (!attachment) {
            throw new Error(`Framebuffer has no attachment with name: '${attachmentName}'`);
        }

        this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
        GlError.check(this.gl, "activeTexture", "set active texture unit");

        this.gl.bindTexture(this.gl.TEXTURE_2D, attachment.handle);
        GlError.check(this.gl, "bindTexture", "binding texture");
    }

    public dispose(): void {
        this.gl.deleteFramebuffer(this.handle);
        GlError.check(this.gl, "deleteFramebuffer", "disposing framebuffer");
        this.attachments.forEach(attachment => {
            this.gl.deleteTexture(attachment.handle);
            GlError.check(this.gl, "deleteTexture", `disposing framebuffer attachment: ${attachment.config.name}`);
        });
    }
}

export default GlFramebuffer;