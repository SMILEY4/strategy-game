import {GlError} from "./gl-error.ts";
import type {GlDisposable} from "@modules/rendergraph/webgl/gl-disposable.ts";
import {GLTextureAttachment} from "@modules/rendergraph/webgl/gl-texture-attachment.ts";

export type GLFramebufferConfig = {
    width: number,
    height: number,
    attachments: ({
        name: string,
        attachment: GLTextureAttachment
    })[]
}

interface InternalFramebufferAttachment {
    name: string,
    attachment: GLTextureAttachment,
    attachmentSlot: number
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
        const {width, height, attachments} = config;

        if (attachments.filter(it => it.attachment.getFormat().isDepth()).length > 1) {
            throw new Error("Could not create framebuffer: more than one depth-attachment defined");
        }

        const fb = gl.createFramebuffer();
        GlError.check(gl, "createFramebuffer", "creating framebuffer");
        if (!fb) {
            throw new Error("Could not create framebuffer");
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        GlError.check(gl, "bindFramebuffer", "binding framebuffer");

        const internalAttachments: InternalFramebufferAttachment[] = [];
        let colorAttachmentSlot = 0;
        attachments.forEach(attachmentConfig => {

            const attachmentPoint = GlFramebuffer.getAttachmentPoint(gl, attachmentConfig.attachment, colorAttachmentSlot)

            gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, attachmentConfig.attachment.getHandle(), 0);

            if (attachmentConfig.attachment.getFormat().isColor()) {
                internalAttachments.push({
                    name: attachmentConfig.name,
                    attachment: attachmentConfig.attachment,
                    attachmentSlot: colorAttachmentSlot,
                });
                colorAttachmentSlot++;
            } else {
                internalAttachments.push({
                    name: attachmentConfig.name,
                    attachment: attachmentConfig.attachment,
                    attachmentSlot: -1,
                });
            }
        });

        // Enable drawBuffers whenever there is 1 or more color buffers
        const drawBuffers: GLenum[] = internalAttachments
            .filter(att => att.attachment.getFormat().isColor())
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

        return new GlFramebuffer(gl, width, height, fb, internalAttachments);
    }

    private static getAttachmentPoint(gl: WebGL2RenderingContext, attachment: GLTextureAttachment, slot: number) {
        return attachment.getFormat().isDepth()
            ? (
                attachment.getFormat().getId() === WebGL2RenderingContext.DEPTH24_STENCIL8
                    ? gl.DEPTH_STENCIL_ATTACHMENT
                    : gl.DEPTH_ATTACHMENT
            )
            : gl.COLOR_ATTACHMENT0 + slot;
    }

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLFramebuffer;
    private readonly attachments: InternalFramebufferAttachment[];
    private readonly attachmentMapping = new Map<string, number>();
    private width: number;
    private height: number;

    private constructor(
        gl: WebGL2RenderingContext,
        width: number,
        height: number,
        handle: WebGLFramebuffer,
        attachments: InternalFramebufferAttachment[],
    ) {
        this.gl = gl;
        this.handle = handle;
        this.width = width;
        this.height = height;
        this.attachments = attachments;
        attachments.forEach((attachment, index) => {
            this.attachmentMapping.set(attachment.name, index);
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
            attachment.attachment.resize(width, height);
            const attachmentPoint = GlFramebuffer.getAttachmentPoint(this.gl, attachment.attachment, attachment.attachmentSlot)
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachmentPoint, this.gl.TEXTURE_2D, attachment.attachment.getHandle(), 0);
        });

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
        const attachment = this.getAttachment(attachmentName)

        this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
        GlError.check(this.gl, "activeTexture", "set active texture unit");

        this.gl.bindTexture(this.gl.TEXTURE_2D, attachment.getHandle());
        GlError.check(this.gl, "bindTexture", "binding texture");
    }

    public dispose(): void {
        this.gl.deleteFramebuffer(this.handle);
        GlError.check(this.gl, "deleteFramebuffer", "disposing framebuffer");
        this.attachments.forEach(attachment => {
            attachment.attachment.dispose(); // todo: how to handle shared attachments? configure with "allowDispose" flag?
        });
    }


    public getAttachment(attachmentName: string): GLTextureAttachment {
        const attachment = this.attachments[this.attachmentMapping.get(attachmentName) ?? -1];
        if (!attachment) {
            throw new Error(`Framebuffer has no attachment with name: '${attachmentName}'`);
        }
        return attachment.attachment
    }
}

export default GlFramebuffer;