import {GLTexture} from "./glTexture";
import {GLFramebuffer} from "./glFramebuffer";

export class GLShaderType {

    public static VERTEX = new GLShaderType(WebGL2RenderingContext.VERTEX_SHADER, "vertex");
    public static FRAGMENT = new GLShaderType(WebGL2RenderingContext.FRAGMENT_SHADER, "fragment");

    readonly displayString: string;
    readonly glEnum: GLenum;

    constructor(glEnum: GLenum, displayString: string) {
        this.glEnum = glEnum;
        this.displayString = displayString;
    }

}


export type GLAttributeComponentAmount = 1 | 2 | 3 | 4;

export class GLAttributeType {

    public static BYTE = new GLAttributeType(1, true, WebGL2RenderingContext.BYTE); // 8-bit integer [-128, 127]
    public static SHORT = new GLAttributeType(2, true, WebGL2RenderingContext.SHORT); // 16-bit integer [-32768, 32767]
    public static INT = new GLAttributeType(4, true, WebGL2RenderingContext.INT); // 32-bit integer
    public static U_BYTE = new GLAttributeType(1, true, WebGL2RenderingContext.UNSIGNED_BYTE); // unsigned 8-bit integer [0, 255]
    public static U_SHORT = new GLAttributeType(2, true, WebGL2RenderingContext.UNSIGNED_SHORT); // unsigned 16-bit integer [0, 65535]
    public static U_INT = new GLAttributeType(4, true, WebGL2RenderingContext.UNSIGNED_INT); // unsigned 32-bit integer
    public static FLOAT = new GLAttributeType(4, false, WebGL2RenderingContext.FLOAT); // 32-bit IEEE floating point number
    public static HALF_FLOAT = new GLAttributeType(2, false, WebGL2RenderingContext.HALF_FLOAT); // 16-bit IEEE floating point number

    readonly bytes: number;
    readonly isInteger: boolean;
    readonly glEnum: GLenum;

    constructor(bytes: number, isInteger: boolean, glEnum: GLenum) {
        this.bytes = bytes;
        this.isInteger = isInteger;
        this.glEnum = glEnum;
    }
}

export type GLUniformValueType = boolean | number | number[] | Float32Array | GLTexture | GLFramebuffer;

export class GLUniformType {
    public static FLOAT = new GLUniformType("FLOAT");
    public static FLOAT_ARRAY = new GLUniformType("FLOAT_ARRAY");
    public static VEC2 = new GLUniformType("VEC2");
    public static VEC2_ARRAY = new GLUniformType("VEC2_ARRAY");
    public static VEC3 = new GLUniformType("VEC3");
    public static VEC3_ARRAY = new GLUniformType("VEC3_ARRAY");
    public static VEC4 = new GLUniformType("VEC4");
    public static VEC4_ARRAY = new GLUniformType("VEC4_ARRAY");
    public static INT = new GLUniformType("INT");
    public static INT_ARRAY = new GLUniformType("INT_ARRAY");
    public static INT_VEC2 = new GLUniformType("INT_VEC2");
    public static INT_VEC2_ARRAY = new GLUniformType("INT_VEC2_ARRAY");
    public static INT_VEC3 = new GLUniformType("INT_VEC3");
    public static INT_VEC3_ARRAY = new GLUniformType("INT_VEC3_ARRAY");
    public static INT_VEC4 = new GLUniformType("INT_VEC4");
    public static INT_VEC4_ARRAY = new GLUniformType("INT_VEC4_ARRAY");
    public static SAMPLER_2D = new GLUniformType("SAMPLER_2D");
    public static SAMPLER_2D_ARRAY = new GLUniformType("SAMPLER_2D_ARRAY");
    public static SAMPLER_CUBE = new GLUniformType("SAMPLER_CUBE");
    public static SAMPLER_CUBE_ARRAY = new GLUniformType("SAMPLER_CUBE_ARRAY");
    public static MAT2 = new GLUniformType("MAT2");
    public static MAT2_ARRAY = new GLUniformType("MAT2_ARRAY");
    public static MAT3 = new GLUniformType("MAT3");
    public static MAT3_ARRAY = new GLUniformType("MAT3_ARRAY");
    public static MAT4 = new GLUniformType("MAT4");
    public static MAT4_ARRAY = new GLUniformType("MAT4_ARRAY");
    public static BOOL = new GLUniformType("BOOL");
    public static BOOL_VEC2 = new GLUniformType("BOOL_VEC2");
    public static BOOL_VEC3 = new GLUniformType("BOOL_VEC3");
    public static BOOL_VEC4 = new GLUniformType("BOOL_VEC4");

    private readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

}