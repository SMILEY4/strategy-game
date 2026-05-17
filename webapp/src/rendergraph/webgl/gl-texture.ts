import type {GlDisposable} from "@rendergraph/webgl/gl-disposable.ts";
import {GlError} from "@rendergraph/webgl/gl-error.ts";

/**
 * Options for texture wrapping behavior (for texture coordinates outside the [0,1] range.
 */
export class GLTextureWrap {

    public static readonly REPEAT = new GLTextureWrap(WebGL2RenderingContext.REPEAT);
    public static readonly MIRRORED_REPEAT = new GLTextureWrap(WebGL2RenderingContext.MIRRORED_REPEAT);
    public static readonly CLAMP_TO_EDGE = new GLTextureWrap(WebGL2RenderingContext.CLAMP_TO_EDGE);

    readonly id: GLint;

    private constructor(id: GLint) {
        this.id = id;
    }
}

/**
 * Options for texture (minification) filter - when image is zoomed in and multiple texels would make up a single fragment
 */
export class GLTextureMinFilter {

    public static readonly LINEAR = new GLTextureMinFilter(WebGL2RenderingContext.LINEAR, false);
    public static readonly NEAREST = new GLTextureMinFilter(WebGL2RenderingContext.NEAREST, false);
    public static readonly NEAREST_MIPMAP_NEAREST = new GLTextureMinFilter(WebGL2RenderingContext.NEAREST_MIPMAP_NEAREST, true);
    public static readonly LINEAR_MIPMAP_NEAREST = new GLTextureMinFilter(WebGL2RenderingContext.LINEAR_MIPMAP_NEAREST, true);
    public static readonly NEAREST_MIPMAP_LINEAR = new GLTextureMinFilter(WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR, true);
    public static readonly LINEAR_MIPMAP_LINEAR = new GLTextureMinFilter(WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR, true);

    readonly id: GLint;
    readonly requiresMipmap: boolean;

    private constructor(id: GLint, requiresMipmap: boolean) {
        this.id = id;
        this.requiresMipmap = requiresMipmap;
    }
}


/**
 * Options for texture (magnification) filter - when image is zoomed out and one texel would take up multiple fragments.
 */
export class GLTextureMagFilter {

    public static readonly LINEAR = new GLTextureMagFilter(WebGL2RenderingContext.LINEAR);
    public static readonly NEAREST = new GLTextureMagFilter(WebGL2RenderingContext.NEAREST);

    readonly id: GLint;

    private constructor(id: GLint) {
        this.id = id;
    }
}

/**
 * Configuration for creating a texture
 */
interface GLTextureConfig {
    wrap?: GLTextureWrap,
    filterMin?: GLTextureMinFilter,
    filterMag?: GLTextureMagFilter,
    flipY?: boolean
}

/**
 * A webgl texture handle.
 */
export class GlTexture implements GlDisposable {

    static readonly DEFAULT_CONFIG: Required<GLTextureConfig> = {
        wrap: GLTextureWrap.REPEAT,
        filterMin: GLTextureMinFilter.NEAREST_MIPMAP_LINEAR,
        filterMag: GLTextureMagFilter.LINEAR,
        flipY: true
    };

    /**
     * Create a new texture from the given path/url. Texture will be a placeholder until actual data image is loaded in the background.
     * @param gl the webgl context
     * @param path the path to the image file
     * @param config the texture config (optional)
     */
    static createFromPath(gl: WebGL2RenderingContext, path: string, config?: GLTextureConfig): GlTexture {

        const mergedConfig: Required<GLTextureConfig> = {...GlTexture.DEFAULT_CONFIG, ...config};

        // create new handle
        const texture = gl.createTexture();
        GlError.check(gl, "createTexture", "creating texture");
        if (!texture) {
            throw new Error("Could not create texture");
        }

        // start using texture
        gl.bindTexture(gl.TEXTURE_2D, texture);
        GlError.check(gl, "bindTexture", "bind texture for creation");

        // apply parameters
        GlTexture.applyParameters(gl, mergedConfig)

        // fill texture with temporary solid color until real image is loaded
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
        GlError.check(gl, "texImage2D", "fill texture with temporary data");

        gl.bindTexture(gl.TEXTURE_2D, null);

        const result = new GlTexture(gl, texture);

        // load real image
        const image = new Image();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        image.addEventListener("error", _ => {
            console.warn("error loading image", path);
        });

        image.addEventListener("load", () => {
            if(result.disposed) {
                image.src = "";
                return;
            }

            // start using texture
            gl.bindTexture(gl.TEXTURE_2D, texture);
            GlError.check(gl, "bindTexture", "bind texture for setting pixels");

            // specify y origin
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, mergedConfig.flipY ? 1 : 0);
            GlError.check(gl, "pixelStorei", "flip image y axis");

            // set texture data
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            GlError.check(gl, "texImage2D", "fill texture with image data");

            // generate mipmaps
            if (mergedConfig.filterMin!.requiresMipmap) {
                gl.generateMipmap(gl.TEXTURE_2D);
                GlError.check(gl, "generateMipmap", "generate mipmaps");
            }

            gl.bindTexture(gl.TEXTURE_2D, null);
        });

        image.src = path;

        return result;
    }


    /**
     * Create a new texture from the given raw byte data
     * @param gl the webgl context
     * @param data the raw byte data of the image
     * @param width the width in "pixels" of the image
     * @param height the height in "pixels" of the image
     * @param config the texture config (optional)
     */
    static createFromData(gl: WebGL2RenderingContext, data: Uint8Array, width: number, height: number, config?: GLTextureConfig): GlTexture {

        const mergedConfig: Required<GLTextureConfig> = {...GlTexture.DEFAULT_CONFIG, ...config};

        // create new handle
        const texture = gl.createTexture();
        GlError.check(gl, "createTexture", "creating texture");
        if (!texture) {
            throw new Error("Could not create texture");
        }

        // start using texture
        gl.bindTexture(gl.TEXTURE_2D, texture);
        GlError.check(gl, "bindTexture", "bind texture for creation");

        GlTexture.applyParameters(gl, mergedConfig)

        // set pixel data
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        GlError.check(gl, "texImage2D", "upload texture data");

        // generate mipmaps
        if(mergedConfig.filterMin.requiresMipmap){
            gl.generateMipmap(gl.TEXTURE_2D);
            GlError.check(gl, "generateMipmap", "generate mipmaps");
        }

        gl.bindTexture(gl.TEXTURE_2D, null);

        return new GlTexture(gl, texture);
    }


    /**
     * Create a new texture from the give canvas
     * @param gl the webgl context
     * @param source the image source, e.g. HTML canvas or image element
     * @param config the texture config (optional)
     */
    static createFromCanvas(gl: WebGL2RenderingContext, source: TexImageSource, config?: GLTextureConfig): GlTexture {

        const mergedConfig: Required<GLTextureConfig> = {...GlTexture.DEFAULT_CONFIG, ...config};

        // create new handle
        const texture = gl.createTexture();
        GlError.check(gl, "createTexture", "creating texture");
        if (!texture) {
            throw new Error("Could not create texture");
        }

        // start using texture
        gl.bindTexture(gl.TEXTURE_2D, texture);
        GlError.check(gl, "bindTexture", "bind texture for creation");

        GlTexture.applyParameters(gl, mergedConfig)

        // specify y origin
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, mergedConfig.flipY ? 1 : 0);
        GlError.check(gl, "pixelStorei", "flip image y axis");

        // set pixel data
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        GlError.check(gl, "texImage2D", "upload texture data");

        // generate mipmaps
        if (mergedConfig.filterMin.requiresMipmap) {
            gl.generateMipmap(gl.TEXTURE_2D);
            GlError.check(gl, "generateMipmap", "generate mipmaps");
        }

        gl.bindTexture(gl.TEXTURE_2D, null);

        return new GlTexture(gl, texture);
    }

    /**
     * Apply parameters from the given config to the currently bound texture
     * @param gl the webgl context
     * @param config the texture config
     * @private
     */
    private static applyParameters(gl: WebGL2RenderingContext, config: Required<GLTextureConfig>): void {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, config.wrap.id,);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, config.wrap.id,);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, config.filterMin.id,);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, config.filterMag.id,);
        GlError.check(gl, "texParameteri", "configure texture");
    }

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLTexture;
    private disposed = false;
    private lastBoundUnit: number = -1;

    private constructor(gl: WebGL2RenderingContext, handle: WebGLTexture) {
        this.gl = gl;
        this.handle = handle;
    }

    /**
     * Bind this texture to the given texture unit
     * @param textureUnit the texture unit to use
     */
    public bind(textureUnit: number) {
        this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
        GlError.check(this.gl, "activeTexture", "set active texture unit");
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.handle);
        GlError.check(this.gl, "bindTexture", "binding texture");
        this.lastBoundUnit = textureUnit
    }

    /**
     * @return the texture unit this texture was last bound to. Note: this might no longer be correct if another texture was bound to the same unit more recently.
     */
    public getLastBoundTextureUnit(): number {
        return this.lastBoundUnit;
    }

    public dispose() {
        this.gl.deleteTexture(this.handle);
        GlError.check(this.gl, "deleteTexture", "disposing texture");
        this.disposed = true
    }

}