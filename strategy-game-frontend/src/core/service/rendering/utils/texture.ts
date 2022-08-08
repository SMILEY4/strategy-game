class Texture {

    private readonly gl: WebGL2RenderingContext;
    private readonly debugName?: string;
    private readonly handle: WebGLTexture | null = null;


    private constructor(gl: WebGL2RenderingContext, handle: WebGLTexture | null, debugName?: string) {
        this.gl = gl;
        this.handle = handle;
        this.debugName = debugName ? debugName : "noname";
    }

    /**
     * Deletes this texture
     */
    public dispose() {
        if (this.handle) {
            this.gl.deleteTexture(this.handle);
        }
    }

	/**
	 * Binds this texture
	 */
    public bind() {
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.handle);
    }


    public static createFromPath(gl: WebGL2RenderingContext, path: string, debugName?: string): Texture {
        // create new texture handle and texture
        const handle = gl.createTexture();
        const texture = new Texture(gl, handle, debugName);
        // start using this texture
        gl.bindTexture(gl.TEXTURE_2D, handle);
        // fill the texture with a temporary solid color, until the real image is loaded
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
        // start loading the real image
        const image = new Image();
        image.src = path;
        image.addEventListener("load", () => {
            gl.bindTexture(gl.TEXTURE_2D, handle);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
        });
        return texture;
    }

    public static createFromData(gl: WebGL2RenderingContext, data: Uint8Array, width: number, height: number, debugName?: string): Texture {
        const handle = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, handle);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        return new Texture(gl, handle, debugName);
    }


    public static createFromCanvas(gl: WebGL2RenderingContext, canvas: TexImageSource, debugName?: string): Texture {
        const handle = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, handle);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return new Texture(gl, handle, debugName);
    }

}

export default Texture;