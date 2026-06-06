import {GlError} from "./gl-error.ts";
import type {GlDisposable} from "@modules/rendergraph/webgl/gl-disposable.ts";

/**
 * A webgl framebuffer handle to render to
 */
export class GlFramebuffer implements GlDisposable {

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
    public static create(gl: WebGL2RenderingContext, config: { width: number, height: number, color?: boolean, depth?: boolean }) {

        const width = config.width;
        const height = config.height;
        const depth = config.depth ?? false;
        const color = config.color ?? true;

        // create framebuffer handle
        const fb = gl.createFramebuffer();
        GlError.check(gl, "createFramebuffer", "creating framebuffer");
        if (fb === null || fb === undefined) {
            throw new Error("Could not create framebuffer");
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        GlError.check(gl, "bindFramebuffer", "binding framebuffer");

        // attach color buffer
        let colorBuffer: WebGLTexture | null = null;
        if (color) {
            colorBuffer = GlFramebuffer.createTargetTexture(gl, width, height);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorBuffer, 0);
            GlError.check(gl, "framebufferTexture2D", "attach texture to framebuffer");
        } else {
            gl.drawBuffers([gl.NONE]);
            gl.readBuffer(gl.NONE);
        }

        // attach depth buffer
        let depthBuffer: WebGLRenderbuffer | null = null;
        if (depth) {
            depthBuffer = GlFramebuffer.createDepthBuffer(gl, width, height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
            GlError.check(gl, "framebufferRenderbuffer", "attach depth buffer to framebuffer");
        }

        // check status
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error(`Framebuffer incomplete: ${status}`);
        }

        // unbind
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        GlError.check(gl, "bindFramebuffer", "unbinding framebuffer");

        return new GlFramebuffer(gl, width, height, fb, colorBuffer, depthBuffer);
    }


    private static createTargetTexture(gl: WebGL2RenderingContext, width: number, height: number): WebGLTexture {

        const textureHandle = gl.createTexture();
        GlError.check(gl, "createTexture", "creating framebuffer-texture");
        if (textureHandle === null || textureHandle === undefined) {
            throw new Error("Could not create framebuffer-texture");
        }

        gl.bindTexture(gl.TEXTURE_2D, textureHandle);
        GlError.check(gl, "bindTexture", "binding framebuffer-texture");

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            width,
            height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        GlError.check(gl, "texImage2D", "filling framebuffer-texture");

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        GlError.check(gl, "texParameteri", "setting parameters of framebuffer-texture");

        gl.bindTexture(gl.TEXTURE_2D, null);

        return textureHandle;
    }

    private static createDepthBuffer(gl: WebGL2RenderingContext, width: number, height: number): WebGLRenderbuffer {
        const depthBuffer = gl.createRenderbuffer();
        GlError.check(gl, "createRenderbuffer", "creating (depth) render buffer");

        if (depthBuffer === null || depthBuffer === undefined) {
            throw new Error("Could not create (depth) renderbuffer");
        }

        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        GlError.check(gl, "bindRenderbuffer", "binding (depth) render buffer");

        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, width, height);
        GlError.check(gl, "renderbufferStorage", "define (depth) render buffer structure");

        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        return depthBuffer;
    }

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLFramebuffer;
    private readonly colorHandle: WebGLTexture | null;
    private readonly depthHandle: WebGLRenderbuffer | null;
    private width: number;
    private height: number;
    private lastBoundUnit: number = -1;

    private constructor(
        gl: WebGL2RenderingContext,
        width: number,
        height: number,
        handle: WebGLFramebuffer,
        colorHandle: WebGLTexture | null,
        depthHandle: WebGLRenderbuffer | null,
    ) {
        this.gl = gl;
        this.handle = handle;
        this.width = width;
        this.height = height;
        this.colorHandle = colorHandle;
        this.depthHandle = depthHandle;
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

        // resize color buffer
        if (this.colorHandle) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.colorHandle);
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0,
                this.gl.RGBA,
                width,
                height,
                0,
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                null,
            );
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            GlError.check(this.gl, "resize-framebuffer", "resizing framebuffer color buffer");
        }

        // resize depth buffer
        if (this.depthHandle) {
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthHandle);
            this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT24, width, height);
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
            GlError.check(this.gl, "resize-framebuffer", "resizing framebuffer depth buffer");
        }

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
     * Unbind this framebuffer
     */
    public unbind() {
        GlFramebuffer.unbind(this.gl);
    }

    /**
     * Bind the color buffer of this framebuffer as a texture to the given texture unit
     * @param textureUnit the target texture unit
     */
    public bindTexture(textureUnit: number) {
        if (!this.colorHandle) {
            throw new Error("Framebuffer has no color attachment");
        }
        this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
        GlError.check(this.gl, "activeTexture", "set active texture unit");
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.colorHandle);
        GlError.check(this.gl, "bindTexture", "binding texture");
        this.lastBoundUnit = textureUnit;
    }

    /**
     * @return the texture unit this framebuffer color buffer was last bound to. Note: this might no longer be correct if another texture was bound to the same unit more recently.
     */
    public getLastBoundTextureUnit(): number {
        return this.lastBoundUnit;
    }

    public dispose(): void {
        this.gl.deleteFramebuffer(this.handle);
        GlError.check(this.gl, "deleteFramebuffer", "disposing framebuffer");
        if (this.colorHandle) {
            this.gl.deleteTexture(this.colorHandle);
            GlError.check(this.gl, "deleteTexture", "disposing framebuffer-texture");
        }
        if (this.depthHandle) {
            this.gl.deleteRenderbuffer(this.depthHandle);
            GlError.check(this.gl, "deleteRenderbuffer", "disposing framebuffer-depth-renderbuffer");
        }
    }

}