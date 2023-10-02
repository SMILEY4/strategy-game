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


export type AttributeComponentAmount = 1 | 2 | 3 | 4;


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
