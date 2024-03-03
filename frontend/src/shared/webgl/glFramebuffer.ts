import {GLDisposable} from "./glDisposable";
import {GLError} from "./glError";

export class GLFramebuffer implements GLDisposable {


    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLFramebuffer;
    private readonly textureHandle: WebGLTexture;
    private width: number;
    private height: number;
    private lastBoundTextureUnit: number = -1;

    constructor(gl: WebGL2RenderingContext, handle: WebGLFramebuffer, textureHandle: WebGLTexture, width: number, height: number) {
        this.gl = gl;
        this.handle = handle;
        this.textureHandle = textureHandle;
        this.width = width;
        this.height = height;
    }

    public getLastBoundTextureUnit(): number {
        return this.lastBoundTextureUnit;
    }

    public resize(width: number, height: number, bind?: boolean) {
        if (width === this.width && height === this.height) {
            return;
        }
        if (bind) {
            this.bind();
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureHandle);
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
        this.width = width;
        this.height = height;
    }

    public bind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.handle);
        GLError.check(this.gl, "bindFramebuffer", "unbinding framebuffer");
    }

    public unbind() {
        GLFramebuffer.unbind(this.gl);
    }

    public bindTexture(textureUnit: number) {
        this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
        GLError.check(this.gl, "activeTexture", "set active texture unit");
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureHandle);
        GLError.check(this.gl, "bindTexture", "binding texture");
        this.lastBoundTextureUnit = textureUnit;
    }

    public dispose(): void {
        this.gl.deleteFramebuffer(this.handle);
        GLError.check(this.gl, "deleteFramebuffer", "disposing framebuffer");
        this.gl.deleteTexture(this.textureHandle);
        GLError.check(this.gl, "deleteTexture", "disposing framebuffer-texture");
    }

}


export namespace GLFramebuffer {

    export function unbind(gl: WebGL2RenderingContext) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        GLError.check(gl, "bindFramebuffer", "unbinding framebuffer");
    }

    export function create(gl: WebGL2RenderingContext, width: number, height: number, depth: boolean) {
        const texture = createTargetTexture(gl, width, height);

        const fb = gl.createFramebuffer();
        GLError.check(gl, "createFramebuffer", "creating framebuffer");

        if (fb === null || fb === undefined) {
            throw new Error("Could not create framebuffer");
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        GLError.check(gl, "bindFramebuffer", "binding framebuffer");

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        GLError.check(gl, "framebufferTexture2D", "attach texture to framebuffer");

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        GLError.check(gl, "bindFramebuffer", "unbinding framebuffer");

        return new GLFramebuffer(gl, fb, texture, width, height);
    }


    function createTargetTexture(gl: WebGL2RenderingContext, width: number, height: number): WebGLTexture {

        const textureHandle = gl.createTexture();
        GLError.check(gl, "createTexture", "creating framebuffer-texture");

        if (textureHandle === null || textureHandle === undefined) {
            throw new Error("Could not create framebuffer-texture");
        }

        gl.bindTexture(gl.TEXTURE_2D, textureHandle);
        GLError.check(gl, "bindTexture", "binding framebuffer-texture");

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
        GLError.check(gl, "texImage2D", "filling framebuffer-texture");

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        GLError.check(gl, "texParameteri", "setting parameters of framebuffer-texture");

        return textureHandle;
    }

}