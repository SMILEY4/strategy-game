import {GLError} from "./glError";
import {GLDisposable} from "./glDisposable";

export class GLTexture implements GLDisposable {

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLTexture;
    private lastBoundTextureUnit: number = -1;

    constructor(gl: WebGL2RenderingContext, handle: WebGLTexture) {
        this.gl = gl;
        this.handle = handle;
    }

    public bind(textureUnit: number) {
        this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
        GLError.check(this.gl, "activeTexture", "set active texture unit");
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.handle);
        GLError.check(this.gl, "bindTexture", "binding texture");
        this.lastBoundTextureUnit = textureUnit;
    }

    public dispose() {
        this.gl.deleteTexture(this.handle);
        GLError.check(this.gl, "deleteTexture", "disposing texture");
    }

    public getLastBoundTextureUnit(): number {
        return this.lastBoundTextureUnit;
    }

}


export class GLTextureWrap {

    public static readonly REPEAT = new GLTextureWrap(WebGL2RenderingContext.REPEAT);
    public static readonly CLAMP_TO_EDGE = new GLTextureWrap(WebGL2RenderingContext.CLAMP_TO_EDGE);
    public static readonly MIRRORED_REPEAT = new GLTextureWrap(WebGL2RenderingContext.MIRRORED_REPEAT);

    readonly id: GLint;

    constructor(id: GLint) {
        this.id = id;
    }
}


export class GLTextureMinFilter {

    public static readonly LINEAR = new GLTextureMinFilter(WebGL2RenderingContext.LINEAR, false);
    public static readonly NEAREST = new GLTextureMinFilter(WebGL2RenderingContext.NEAREST, false);
    public static readonly NEAREST_MIPMAP_NEAREST = new GLTextureMinFilter(WebGL2RenderingContext.NEAREST_MIPMAP_NEAREST, true);
    public static readonly LINEAR_MIPMAP_NEAREST = new GLTextureMinFilter(WebGL2RenderingContext.LINEAR_MIPMAP_NEAREST, true);
    public static readonly NEAREST_MIPMAP_LINEAR = new GLTextureMinFilter(WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR, true);
    public static readonly LINEAR_MIPMAP_LINEAR = new GLTextureMinFilter(WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR, true);

    readonly id: GLint;
    readonly requiresMipmap: boolean;

    constructor(id: GLint, requiresMipmap: boolean) {
        this.id = id;
        this.requiresMipmap = requiresMipmap;
    }
}


export class GLTextureMagFilter {

    public static readonly LINEAR = new GLTextureMagFilter(WebGL2RenderingContext.LINEAR);
    public static readonly NEAREST = new GLTextureMagFilter(WebGL2RenderingContext.NEAREST);

    readonly id: GLint;

    constructor(id: GLint) {
        this.id = id;
    }
}


export namespace GLTexture {

    export interface Config {
        wrap?: GLTextureWrap,
        filterMin?: GLTextureMinFilter,
        filterMag?: GLTextureMagFilter,
    }

    const DEFAULT_CONFIG: Config = {
        wrap: GLTextureWrap.REPEAT,
        filterMin: GLTextureMinFilter.NEAREST_MIPMAP_LINEAR,
        filterMag: GLTextureMagFilter.LINEAR,
    };

    export function createFromPath(gl: WebGL2RenderingContext, path: string, config?: Config): GLTexture {

        const mergedConfig: Config = {...DEFAULT_CONFIG, ...config};

        // create new handle
        const texture = gl.createTexture();
        GLError.check(gl, "createTexture", "creating texture");
        if (!texture) {
            throw new Error("Could not create texture");
        }

        // start using texture
        gl.bindTexture(gl.TEXTURE_2D, texture);
        GLError.check(gl, "bindTexture", "bind texture for creation");

        // fill texture with temporary solid color until real image is loaded
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
        GLError.check(gl, "texImage2D", "fill texture with temporary data");

        // load real image
        const image = new Image();
        image.src = path;
        image.addEventListener("load", () => {

            // start using texture
            gl.bindTexture(gl.TEXTURE_2D, texture);
            GLError.check(gl, "bindTexture", "bind texture for setting pixels");

            // set texture data
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            GLError.check(gl, "texImage2D", "fill texture with image data");

            // generate mipmaps
            if (mergedConfig.filterMin!.requiresMipmap) {
                gl.generateMipmap(gl.TEXTURE_2D);
                GLError.check(gl, "generateMipmap", "generate mipmaps");
            }

            // wrap
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, mergedConfig.wrap!.id);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, mergedConfig.wrap!.id);
            GLError.check(gl, "texParameteri", "set texture wrap");

            // filter
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mergedConfig.filterMin!.id);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mergedConfig.filterMag!.id);
            GLError.check(gl, "texParameteri", "set texture filter");

        });

        return new GLTexture(gl, texture);
    }


    export function createFromData(gl: WebGL2RenderingContext, data: Uint8Array, width: number, height: number): GLTexture {

        // create new handle
        const texture = gl.createTexture();
        GLError.check(gl, "createTexture", "creating texture");
        if (!texture) {
            throw new Error("Could not create texture");
        }

        // start using texture
        gl.bindTexture(gl.TEXTURE_2D, texture);
        GLError.check(gl, "bindTexture", "bind texture for creation");

        // set pixel data
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        GLError.check(gl, "texImage2D", "fill texture with pixel data");

        // generate mipmaps
        gl.generateMipmap(gl.TEXTURE_2D);
        GLError.check(gl, "generateMipmap", "generate mipmaps");

        return new GLTexture(gl, texture);
    }


    export function createFromCanvas(gl: WebGL2RenderingContext, canvas: TexImageSource): GLTexture {

        // create new handle
        const texture = gl.createTexture();
        GLError.check(gl, "createTexture", "creating texture");
        if (!texture) {
            throw new Error("Could not create texture");
        }

        // start using texture
        gl.bindTexture(gl.TEXTURE_2D, texture);
        GLError.check(gl, "bindTexture", "bind texture for creation");

        // set pixel data
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        GLError.check(gl, "texImage2D", "fill texture with canvas data");

        // generate mipmaps
        gl.generateMipmap(gl.TEXTURE_2D);
        GLError.check(gl, "generateMipmap", "generate mipmaps");

        return new GLTexture(gl, texture);
    }

}