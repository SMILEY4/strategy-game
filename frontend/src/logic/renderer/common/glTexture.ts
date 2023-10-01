import {GLError} from "./glError";

export class GLTexture {

    /**
     * Create a new texture from a file at the given location
     */
    public static createFromPath(gl: WebGL2RenderingContext, path: string, debugName?: string): GLTexture {
        // create new texture handle and texture
        const handle = gl.createTexture();
        // start using the texture
        gl.bindTexture(gl.TEXTURE_2D, handle);
        // fill the texture with a temporary solid color, until the real image is loaded
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
        // start loading the real image
        const image = new Image();
        image.src = path;
        image.addEventListener("load", () => {
            gl.bindTexture(gl.TEXTURE_2D, handle);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
        });
        GLError.check(gl)
        return new GLTexture(gl, handle, debugName);
    }

    /**
     * Create a new texture from the given pixel-data
     */
    public static createFromData(gl: WebGL2RenderingContext, data: Uint8Array, width: number, height: number, debugName?: string): GLTexture {
        const handle = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, handle);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        GLError.check(gl)
        return new GLTexture(gl, handle, debugName);
    }


    /**
     * Create a new texture from the current content of the given canvas
     */
    public static createFromCanvas(gl: WebGL2RenderingContext, canvas: TexImageSource, debugName?: string): GLTexture {
        const handle = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, handle);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        GLError.check(gl)
        return new GLTexture(gl, handle, debugName);
    }


    private readonly gl: WebGL2RenderingContext;
    private readonly debugName: string;
    private readonly handle: WebGLTexture | null = null;

    private constructor(gl: WebGL2RenderingContext, handle: WebGLTexture | null, debugName?: string) {
        this.gl = gl;
        this.handle = handle;
        this.debugName = debugName ? debugName : "noname";
    }


    /**
     * Binds this texture
     */
    public bind(textureUnit: number) {
        this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.handle);
        GLError.check(this.gl)
    }


    /**
     * Deletes this texture
     */
    public dispose() {
        if (this.handle) {
            this.gl.deleteTexture(this.handle);
            GLError.check(this.gl)
        }
    }

}