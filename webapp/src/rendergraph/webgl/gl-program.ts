import type { GlDisposable } from "./gl-disposable";
import {GlError} from "@rendergraph/webgl/gl-error.ts";
import {GlTexture} from "@rendergraph/webgl/gl-texture.ts";
import {GlFramebuffer} from "@rendergraph/webgl/gl-framebuffer.ts";

/**
 * The type of individual webgl shader program
 */
export class GLShaderType {

    public static VERTEX = new GLShaderType(WebGL2RenderingContext.VERTEX_SHADER, "vertex");
    public static FRAGMENT = new GLShaderType(WebGL2RenderingContext.FRAGMENT_SHADER, "fragment");

    readonly displayString: string;
    readonly glEnum: GLenum;

    private constructor(glEnum: GLenum, displayString: string) {
        this.glEnum = glEnum;
        this.displayString = displayString;
    }

}

/**
 * The amount of components for a vertex attribute (e.g. an attribute of type "float" -> amount = 1 => 1x float, amount = 3 => 3d float vector)
 */
export type GlAttributeComponentAmount = 1 | 2 | 3 | 4;

/**
 * Available webgl data types for vertex attributes.
 * Vectors / multidimensional attributes (e.g. a 3d float vector) are represented as a data type in combination with a component amount.
 */
export class GlAttributeType {

    /** 8-bit signed integer [-128, 127] */
    public static BYTE = new GlAttributeType(1, true, WebGL2RenderingContext.BYTE);
    /** 16-bit signed integer [-32768, 32767] */
    public static SHORT = new GlAttributeType(2, true, WebGL2RenderingContext.SHORT);
    /** 32-bit signed integer */
    public static INT = new GlAttributeType(4, true, WebGL2RenderingContext.INT);
    /** unsigned 8-bit integer [0, 255] */
    public static U_BYTE = new GlAttributeType(1, true, WebGL2RenderingContext.UNSIGNED_BYTE);
    /** unsigned 16-bit integer [0, 65535] */
    public static U_SHORT = new GlAttributeType(2, true, WebGL2RenderingContext.UNSIGNED_SHORT);
    /** unsigned 32-bit integer */
    public static U_INT = new GlAttributeType(4, true, WebGL2RenderingContext.UNSIGNED_INT);
    /** 32-bit IEEE floating point number */
    public static FLOAT = new GlAttributeType(4, false, WebGL2RenderingContext.FLOAT);
    /** 16-bit IEEE floating point number */
    public static HALF_FLOAT = new GlAttributeType(2, false, WebGL2RenderingContext.HALF_FLOAT);
    /** utility type. 8-bit padding (no data). Note: vertices (not individual attributes) must be byte aligned to the largest data type in the buffer. */
    public static PADDING = new GlAttributeType(1, false, WebGL2RenderingContext.BYTE);

    readonly bytes: number;
    readonly isInteger: boolean;
    readonly glEnum: GLenum;

    private constructor(bytes: number, isInteger: boolean, glEnum: GLenum) {
        this.bytes = bytes;
        this.isInteger = isInteger;
        this.glEnum = glEnum;
    }
}

/**
 * Available (js) types for shader uniforms
 */
export type GLUniformValueType = boolean | number | number[] | Float32Array | GlTexture | GlFramebuffer;

/**
 * Available webgl data types for uniform values.
 */
export class GLUniformType {
    public static readonly FLOAT = new GLUniformType("FLOAT", WebGL2RenderingContext.FLOAT, false);
    public static readonly VEC2 = new GLUniformType("VEC2", WebGL2RenderingContext.FLOAT_VEC2, false);
    public static readonly VEC3 = new GLUniformType("VEC3", WebGL2RenderingContext.FLOAT_VEC3, false);
    public static readonly VEC4 = new GLUniformType("VEC4", WebGL2RenderingContext.FLOAT_VEC4, false);
    public static readonly FLOAT_ARRAY = new GLUniformType("FLOAT_ARRAY", WebGL2RenderingContext.FLOAT, true);
    public static readonly VEC2_ARRAY = new GLUniformType("VEC2_ARRAY", WebGL2RenderingContext.FLOAT_VEC2, true);
    public static readonly VEC3_ARRAY = new GLUniformType("VEC3_ARRAY", WebGL2RenderingContext.FLOAT_VEC3, true);
    public static readonly VEC4_ARRAY = new GLUniformType("VEC4_ARRAY", WebGL2RenderingContext.FLOAT_VEC4, true);
    public static readonly INT = new GLUniformType("INT", WebGL2RenderingContext.INT, false);
    public static readonly INT_VEC2 = new GLUniformType("INT_VEC2", WebGL2RenderingContext.INT_VEC2, false);
    public static readonly INT_VEC3 = new GLUniformType("INT_VEC3", WebGL2RenderingContext.INT_VEC3, false);
    public static readonly INT_VEC4 = new GLUniformType("INT_VEC4", WebGL2RenderingContext.INT_VEC4, false);
    public static readonly INT_ARRAY = new GLUniformType("INT_ARRAY", WebGL2RenderingContext.INT, true);
    public static readonly INT_VEC2_ARRAY = new GLUniformType("INT_VEC2_ARRAY", WebGL2RenderingContext.INT_VEC2, true);
    public static readonly INT_VEC3_ARRAY = new GLUniformType("INT_VEC3_ARRAY", WebGL2RenderingContext.INT_VEC3, true);
    public static readonly INT_VEC4_ARRAY = new GLUniformType("INT_VEC4_ARRAY", WebGL2RenderingContext.INT_VEC4, true);
    public static readonly BOOL = new GLUniformType("BOOL", WebGL2RenderingContext.BOOL, false);
    public static readonly BOOL_VEC2 = new GLUniformType("BOOL_VEC2", WebGL2RenderingContext.BOOL_VEC2, false);
    public static readonly BOOL_VEC3 = new GLUniformType("BOOL_VEC3", WebGL2RenderingContext.BOOL_VEC3, false);
    public static readonly BOOL_VEC4 = new GLUniformType("BOOL_VEC4", WebGL2RenderingContext.BOOL_VEC4, false);
    public static readonly MAT2 = new GLUniformType("MAT2", WebGL2RenderingContext.FLOAT_MAT2, false);
    public static readonly MAT3 = new GLUniformType("MAT3", WebGL2RenderingContext.FLOAT_MAT3, false);
    public static readonly MAT4 = new GLUniformType("MAT4", WebGL2RenderingContext.FLOAT_MAT4, false);
    public static readonly MAT2_ARRAY = new GLUniformType("MAT2_ARRAY", WebGL2RenderingContext.FLOAT_MAT2, true);
    public static readonly MAT3_ARRAY = new GLUniformType("MAT3_ARRAY", WebGL2RenderingContext.FLOAT_MAT3, true);
    public static readonly MAT4_ARRAY = new GLUniformType("MAT4_ARRAY", WebGL2RenderingContext.FLOAT_MAT4, true);
    public static readonly SAMPLER_2D = new GLUniformType("SAMPLER_2D", WebGL2RenderingContext.SAMPLER_2D, false);
    public static readonly SAMPLER_CUBE = new GLUniformType("SAMPLER_CUBE", WebGL2RenderingContext.SAMPLER_CUBE, false);
    public static readonly SAMPLER_2D_ARRAY = new GLUniformType("SAMPLER_2D_ARRAY", WebGL2RenderingContext.SAMPLER_2D, true);
    public static readonly SAMPLER_CUBE_ARRAY = new GLUniformType("SAMPLER_CUBE_ARRAY", WebGL2RenderingContext.SAMPLER_CUBE, true);
    public static readonly UNSIGNED_INT = new GLUniformType("UNSIGNED_INT", WebGL2RenderingContext.UNSIGNED_INT, false);
    public static readonly UNSIGNED_INT_VEC2 = new GLUniformType("UNSIGNED_INT_VEC2", WebGL2RenderingContext.UNSIGNED_INT_VEC2, false);
    public static readonly UNSIGNED_INT_VEC3 = new GLUniformType("UNSIGNED_INT_VEC3", WebGL2RenderingContext.UNSIGNED_INT_VEC3, false);
    public static readonly UNSIGNED_INT_VEC4 = new GLUniformType("UNSIGNED_INT_VEC4", WebGL2RenderingContext.UNSIGNED_INT_VEC4, false);
    public static readonly UNSIGNED_INT_ARRAY = new GLUniformType("UNSIGNED_INT_ARRAY", WebGL2RenderingContext.UNSIGNED_INT, true);
    public static readonly UNSIGNED_INT_VEC2_ARRAY = new GLUniformType("UNSIGNED_INT_VEC2_ARRAY", WebGL2RenderingContext.UNSIGNED_INT_VEC2, true);
    public static readonly UNSIGNED_INT_VEC3_ARRAY = new GLUniformType("UNSIGNED_INT_VEC3_ARRAY", WebGL2RenderingContext.UNSIGNED_INT_VEC3, true);
    public static readonly UNSIGNED_INT_VEC4_ARRAY = new GLUniformType("UNSIGNED_INT_VEC4_ARRAY", WebGL2RenderingContext.UNSIGNED_INT_VEC4, true);

    public static readonly allEntries = [
        GLUniformType.FLOAT,
        GLUniformType.VEC2,
        GLUniformType.VEC3,
        GLUniformType.VEC4,
        GLUniformType.FLOAT_ARRAY,
        GLUniformType.VEC2_ARRAY,
        GLUniformType.VEC3_ARRAY,
        GLUniformType.VEC4_ARRAY,
        GLUniformType.INT,
        GLUniformType.INT_VEC2,
        GLUniformType.INT_VEC3,
        GLUniformType.INT_VEC4,
        GLUniformType.INT_ARRAY,
        GLUniformType.INT_VEC2_ARRAY,
        GLUniformType.INT_VEC3_ARRAY,
        GLUniformType.INT_VEC4_ARRAY,
        GLUniformType.BOOL,
        GLUniformType.BOOL_VEC2,
        GLUniformType.BOOL_VEC3,
        GLUniformType.BOOL_VEC4,
        GLUniformType.MAT2,
        GLUniformType.MAT3,
        GLUniformType.MAT4,
        GLUniformType.MAT2_ARRAY,
        GLUniformType.MAT3_ARRAY,
        GLUniformType.MAT4_ARRAY,
        GLUniformType.SAMPLER_2D,
        GLUniformType.SAMPLER_CUBE,
        GLUniformType.SAMPLER_2D_ARRAY,
        GLUniformType.SAMPLER_CUBE_ARRAY,
        GLUniformType.UNSIGNED_INT,
        GLUniformType.UNSIGNED_INT_VEC2,
        GLUniformType.UNSIGNED_INT_VEC3,
        GLUniformType.UNSIGNED_INT_VEC4,
        GLUniformType.UNSIGNED_INT_ARRAY,
        GLUniformType.UNSIGNED_INT_VEC2_ARRAY,
        GLUniformType.UNSIGNED_INT_VEC3_ARRAY,
        GLUniformType.UNSIGNED_INT_VEC4_ARRAY,
    ]

    readonly name: string;
    readonly glEnum: GLenum;
    readonly isArray: boolean;

    private constructor(name: string, glEnum: GLenum, isArray: boolean) {
        this.name = name;
        this.glEnum = glEnum;
        this.isArray = isArray;
    }

}

/**
 * Information about the "public interface" of a webgl program
 */
export interface GLProgramInformation {
    /** the list of attributes */
    attributes: GLProgramAttribute[],
    /** the list of uniforms */
    uniforms: GLProgramUniform[],
}

/**
 * Describes a single shader attribute
 */
export interface GLProgramAttribute {
    /** the name of the attribute in the shader code */
    name: string,
    /** the webgl handle for the attribute */
    location: GLint
}

/**
 * Describes a single uniform
 */
export interface GLProgramUniform {
    /** the name of the uniform in the shader code */
    name: string,
    /** the webgl handle for the uniform */
    location: WebGLUniformLocation,
    /** the webgl data type of the uniform */
    type: GLUniformType,
}

/**
 * Error report from compiling a webgl shader
 */
interface ShaderErrorReport {
    source: string[],
    errors: ({
        lineNumber: number,
        line: string
        error: string
    })[]
}

/**
 * A webgl program consisting of a vertex and a fragment shader
 */
export class GlProgram implements GlDisposable {

    /**
     * Create a new webgl program consisting of a vertex and fragment shader
     * @param gl the webgl context
     * @param srcVertex the complete source code of the vertex shader
     * @param srcFragment the complete source code of the fragment shader
     */
    public static create(gl: WebGL2RenderingContext, srcVertex: string, srcFragment: string) {
        const shaderVertex = GlProgram.createShader(gl, GLShaderType.VERTEX, srcVertex);
        const shaderFragment = GlProgram.createShader(gl, GLShaderType.FRAGMENT, srcFragment);
        const program = GlProgram.createProgram(gl, shaderVertex, shaderFragment);
        const uniforms = GlProgram.getUniforms(gl, program);
        const attributes = GlProgram.getAttributes(gl, program);
        const information = {uniforms: uniforms, attributes: attributes};
        return new GlProgram(gl, program, information);
    }


    /**
     * Create a new shader - either a vertex or a fragment shader
     * @param gl the webgl context
     * @param type the type of the shader to create - vertex or fragment
     * @param source the complete source code of the shader
     * @private
     */
    private static createShader(gl: WebGL2RenderingContext, type: GLShaderType, source: string): WebGLShader {
        // create a new shader handle
        const shader = gl.createShader(type.glEnum);
        GlError.check(gl, "createShader", "creating shader (" + type.displayString + ")");
        if (!shader) {
            throw new Error("Could not create shader (" + type.displayString + ")");
        }

        // upload shader source code
        gl.shaderSource(shader, source);
        GlError.check(gl, "shaderSource", "uploading shader source (" + type.displayString + ")");

        // compile shader
        gl.compileShader(shader);
        GlError.check(gl, "compileShader", "compiling shader (" + type.displayString + ")");

        // check status if successful
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        } else {
            const errorReport = GlProgram.getErrorReport(gl, shader, source);
            console.error("Error during shader compilation", errorReport)
            gl.deleteShader(shader);
            GlError.check(gl, "deleteShader", "deleting failed shader (" + type.displayString + ")");
            throw new Error("Failed to create shader (" + type.displayString + ")");
        }
    }

    /**
     * Combine a vertex and fragment shader and create a webgl program
     * @param gl the webgl context
     * @param shaderVertex the vertex shader
     * @param shaderFragment the fragment shader
     * @private
     */
    private static createProgram(gl: WebGL2RenderingContext, shaderVertex: WebGLShader, shaderFragment: WebGLShader): WebGLProgram {
        // create new program handle
        const program = gl.createProgram();
        GlError.check(gl, "createProgram", "creating program");
        if (!program) {
            throw new Error("Could not create program");
        }

        // attach vertex and fragment shaders to program
        gl.attachShader(program, shaderVertex);
        GlError.check(gl, "attachShader", "attaching vertex shader");
        gl.attachShader(program, shaderFragment);
        GlError.check(gl, "attachShader", "attaching fragment shader");

        //complete program creation
        gl.linkProgram(program);
        GlError.check(gl, "linkProgram", "linking program");

        // check status if successful
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            return program;
        } else {
            gl.deleteShader(shaderVertex)
            GlError.check(gl, "deleteShader", "deleting vertex shader after failed program");
            gl.deleteShader(shaderFragment);
            GlError.check(gl, "deleteShader", "deleting fragment shader after failed program");
            gl.deleteProgram(program);
            GlError.check(gl, "deleteProgram", "deleting failed program");
            throw new Error("Error during shader-program creation");
        }
    }

    /**
     * Fetch the list of uniforms from the given program
     * @param gl the webgl context
     * @param program the program
     * @private
     */
    private static getUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): GLProgramUniform[] {
        const uniforms: GLProgramUniform[] = [];

        const amount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        GlError.check(gl, "getProgramParameter", "get amount of (active) uniforms");

        for (let i = 0; i < amount; i++) {
            const uniform = gl.getActiveUniform(program, i);
            GlError.check(gl, "getActiveUniform", "get information about (active) uniform");

            if (uniform) {

                const location = gl.getUniformLocation(program, uniform.name);
                GlError.check(gl, "getUniformLocation", "getting program uniform location");
                if (location === null) {
                    throw new Error("Could not get location for uniform " + uniform.name);
                }

                const dataType = GLUniformType.allEntries.find(it => it.glEnum === uniform.type && it.isArray === uniform.size > 1)
                if(!dataType) {
                    throw new Error("could not determine data type for uniform " + uniform.name)
                }

                uniforms.push({
                    name: uniform.name,
                    location: location,
                    type: dataType
                });
            }

        }

        return uniforms;
    }

    /**
     * Fetch the list of attributes from the given program
     * @param gl the webgl context
     * @param program the program
     * @private
     */
    private static getAttributes(gl: WebGL2RenderingContext, program: WebGLProgram): GLProgramAttribute[] {
        const attributes: GLProgramAttribute[] = [];

        const amount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        GlError.check(gl, "getProgramParameter", "get amount of (active) attributes");

        for (let i = 0; i < amount; i++) {
            const attribute = gl.getActiveAttrib(program, i);
            GlError.check(gl, "getActiveAttrib", "get information about (active) attribute");

            if (attribute) {
                const location = gl.getAttribLocation(program, attribute.name);
                GlError.check(gl, "getAttribLocation", "getting program attribute location");
                if (location === null) {
                    throw new Error("Could not get attribute for uniform " + attribute.name);
                }
                attributes.push({
                    name: attribute.name,
                    location: location,
                });
            }
        }

        return attributes;
    }

    /**
     * Get and create a comprehensive error report for the shader compilation.
     * @param gl the webgl context
     * @param shader the shader
     * @param source the complete source code
     * @private
     */
    private static getErrorReport(gl: WebGL2RenderingContext, shader: WebGLShader, source: string): ShaderErrorReport {
        const GlErrorMsg = gl.getShaderInfoLog(shader);
        if (GlErrorMsg) {
            const codeLines = source.split(/\r\n|\n\r|\n|\r/);
            const errors = GlErrorMsg
                .split(/\r\n|\n\r|\n|\r/)
                .map(e => e.trim())
                .filter(e => e.length > 0)
                .map(e => {
                    const parts = e.split(":");
                    const lineNumber = parseInt(parts[2]);
                    const details = parts.splice(3, parts.length).join().trim();
                    return {
                        lineNumber: lineNumber,
                        line: codeLines[lineNumber].trim(),
                        error: details,
                    };
                });
            return {
                source: codeLines.map((l, i) => i + ":   " + l),
                errors: errors
            };
        } else {
            return {
                source: source.split(/\r\n|\n\r|\n|\r/).map((l, i) => i + ":   " + l),
                errors: []
            };
        }
    }

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLProgram;
    private readonly information: GLProgramInformation;

    private constructor(gl: WebGL2RenderingContext, handle: WebGLProgram, information: GLProgramInformation) {
        this.gl = gl;
        this.handle = handle;
        this.information = information;
    }

    /**
     * @return information about the "public interface" of this program, e.g. attributes and uniforms
     */
    public getInformation(): GLProgramInformation {
        return this.information;
    }

    /**
     * Start using this shader, making this the active one
     */
    public use() {
        this.gl.useProgram(this.handle);
        GlError.check(this.gl, "useProgram", "using program");
    }

    public dispose() {
        this.gl.deleteProgram(this.handle);
        GlError.check(this.gl, "deleteProgram", "disposing program");
    }

    /**
     * Set the uniform parameter with the given name to the given value
     * @param name the name of the uniform in the shader code
     * @param value the value to set it to
     * @param type the type of the uniform (set undefined to determine automatically)
     */
    public setUniform(name: string, value: GLUniformValueType, type?: GLUniformType) {
        const information = this.information.uniforms.find(u => u.name === name);
        if (information) {
            const datatype = type ? type : information.type
            this.setUniformValue(name, information.location, datatype, value);
        }
    }

    /**
     * Set the given uniform to the given value
     */
    private setUniformValue(name: string, location: WebGLUniformLocation, type: GLUniformType, values: GLUniformValueType) {
        const valuesFormatted: number[] | Float32Array = this.formatUniformValues(values);
        switch (type) {
            case GLUniformType.FLOAT:
                this.gl.uniform1f(location, valuesFormatted[0]);
                break;
            case GLUniformType.VEC2:
                this.gl.uniform2f(location, valuesFormatted[0], valuesFormatted[1]);
                break;
            case GLUniformType.VEC3:
                this.gl.uniform3f(location, valuesFormatted[0], valuesFormatted[1], valuesFormatted[2]);
                break;
            case GLUniformType.VEC4:
                this.gl.uniform4f(location, valuesFormatted[0], valuesFormatted[1], valuesFormatted[2], valuesFormatted[3]);
                break;
            case GLUniformType.FLOAT_ARRAY:
                this.gl.uniform1fv(location, valuesFormatted);
                break;
            case GLUniformType.VEC2_ARRAY:
                this.gl.uniform2fv(location, valuesFormatted);
                break;
            case GLUniformType.VEC3_ARRAY:
                this.gl.uniform3fv(location, valuesFormatted);
                break;
            case GLUniformType.VEC4_ARRAY:
                this.gl.uniform4fv(location, valuesFormatted);
                break;
            case GLUniformType.BOOL:
            case GLUniformType.SAMPLER_2D:
            case GLUniformType.SAMPLER_CUBE:
            case GLUniformType.INT:
                this.gl.uniform1i(location, valuesFormatted[0]);
                break;
            case GLUniformType.SAMPLER_2D_ARRAY:
            case GLUniformType.SAMPLER_CUBE_ARRAY:
            case GLUniformType.INT_ARRAY:
                this.gl.uniform1iv(location, valuesFormatted);
                break;
            case GLUniformType.BOOL_VEC2:
            case GLUniformType.INT_VEC2:
                this.gl.uniform2i(location, valuesFormatted[0], valuesFormatted[1]);
                break;
            case GLUniformType.INT_VEC2_ARRAY:
                this.gl.uniform2iv(location, valuesFormatted);
                break;
            case GLUniformType.BOOL_VEC3:
            case GLUniformType.INT_VEC3:
                this.gl.uniform3i(location, valuesFormatted[0], valuesFormatted[1], valuesFormatted[2]);
                break;
            case GLUniformType.INT_VEC3_ARRAY:
                this.gl.uniform3iv(location, valuesFormatted);
                break;
            case GLUniformType.BOOL_VEC4:
            case GLUniformType.INT_VEC4:
                this.gl.uniform4i(location, valuesFormatted[0], valuesFormatted[1], valuesFormatted[2], valuesFormatted[3]);
                break;
            case GLUniformType.INT_VEC4_ARRAY:
                this.gl.uniform4iv(location, valuesFormatted);
                break;
            case GLUniformType.MAT2:
            case GLUniformType.MAT2_ARRAY:
                this.gl.uniformMatrix2fv(location, false, valuesFormatted);
                break;
            case GLUniformType.MAT3:
            case GLUniformType.MAT3_ARRAY:
                this.gl.uniformMatrix3fv(location, false, valuesFormatted);
                break;
            case GLUniformType.MAT4:
            case GLUniformType.MAT4_ARRAY:
                this.gl.uniformMatrix4fv(location, false, valuesFormatted);
                break;
            case GLUniformType.UNSIGNED_INT:
                this.gl.uniform1ui(location, valuesFormatted[0]);
                break
            case GLUniformType.UNSIGNED_INT_VEC2:
                this.gl.uniform2ui(location, valuesFormatted[0], valuesFormatted[1]);
                break
            case GLUniformType.UNSIGNED_INT_VEC3:
                this.gl.uniform3ui(location, valuesFormatted[0], valuesFormatted[1], valuesFormatted[2]);
                break
            case GLUniformType.UNSIGNED_INT_VEC4:
                this.gl.uniform4ui(location, valuesFormatted[0], valuesFormatted[1], valuesFormatted[2], valuesFormatted[3]);
                break
            case GLUniformType.UNSIGNED_INT_ARRAY:
                this.gl.uniform1uiv(location, valuesFormatted);
                break
            case GLUniformType.UNSIGNED_INT_VEC2_ARRAY:
                this.gl.uniform2uiv(location, valuesFormatted);
                break
            case GLUniformType.UNSIGNED_INT_VEC3_ARRAY:
                this.gl.uniform3uiv(location, valuesFormatted);
                break
            case GLUniformType.UNSIGNED_INT_VEC4_ARRAY:
                this.gl.uniform4uiv(location, valuesFormatted);
                break
        }
        GlError.check(this.gl, "uniform[...]", "setting program uniform value '" + name + "'");
    }

    /**
     * Converts the given uniform value into a more convenient format
     * @param values the value to set a uniform to
     * @private
     */
    private formatUniformValues(values: GLUniformValueType): number[] | Float32Array {
        if (Array.isArray(values)) {
            return values;
        } else if (values instanceof Float32Array) {
            return values;
        } else if (values instanceof GlTexture) {
            return [values.getLastBoundTextureUnit()];
        } else if (values instanceof GlFramebuffer) {
            return [values.getLastBoundTextureUnit()];
        } else if(typeof values == "boolean") {
            return values ? [1] : [0]
        } else {
            return [values];
        }
    }

}