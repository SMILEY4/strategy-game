export enum ShaderAttributeType {
    BYTE, // 8-bit integer [-128, 127]
    SHORT, // 16-bit integer [-32768, 32767]
    U_BYTE, // unsigned 8-bit integer [0, 255]
    U_SHORT, // unsigned 16-bit integer [0, 65535]
    FLOAT, // 32-bit IEEE floating point number
    HALF_FLOAT, // 16-bit IEEE floating point number
}

export enum ShaderUniformType {
    FLOAT,
    FLOAT_ARRAY,
    VEC2,
    VEC2_ARRAY,
    VEC3,
    VEC3_ARRAY,
    VEC4,
    VEC4_ARRAY,
    INT,
    INT_ARRAY,
    INT_VEC2,
    INT_VEC2_ARRAY,
    INT_VEC3,
    INT_VEC3_ARRAY,
    INT_VEC4,
    INT_VEC4_ARRAY,
    SAMPLER_2D,
    SAMPLER_2D_ARRAY,
    SAMPLER_CUBE,
    SAMPLER_CUBE_ARRAY,
    MAT2,
    MAT2_ARRAY,
    MAT3,
    MAT3_ARRAY,
    MAT4,
    MAT4_ARRAY,
    BOOL,
    BOOL_VEC2,
    BOOL_VEC3,
    BOOL_VEC4,
}

export type UniformValueType = number | number[] | Float32Array

interface ShaderReport {
    source: string[],
    errors: ({
        lineNumber: number,
        line: string
        error: string
    })[]
}

export class GLProgram {

    public static create(gl: WebGL2RenderingContext, srcVertex: string, srcFragment: string, debugName?: string): GLProgram {
        const shaderVertex = this.createShader(gl, "vertex", srcVertex, debugName);
        const shaderFragment = this.createShader(gl, "fragment", srcFragment, debugName);
        const program = this.createShaderProgram(gl, shaderVertex, shaderFragment);
        return new GLProgram(gl, program, debugName);
    }

    private static createShader(gl: WebGL2RenderingContext, type: "vertex" | "fragment", source: string, debugName: string | undefined): WebGLShader {
        // create a new shader handle
        const shader = gl.createShader(type === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
        if (!shader) {
            throw new Error("Could not create " + type + " shader");
        }
        // upload and compile shader-source
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        // check status if successful
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        } else {
            const errorReport = GLProgram.getErrorReport(gl, shader, source);
            gl.deleteShader(shader);
            console.warn("Error during " + type + " shader creation (name=" + debugName + ")", errorReport);
            throw new Error("Failed to create shader (name=" + debugName + ")");
        }
    }

    private static createShaderProgram(gl: WebGL2RenderingContext, shaderVertex: WebGLShader, vertexFragment: WebGLShader): WebGLProgram {
        // create a new program handle
        const program = gl.createProgram();
        if (!program) {
            throw new Error("Could not create shader program");
        }
        // attach the vertex and fragment shaders to the created program
        gl.attachShader(program, shaderVertex);
        gl.attachShader(program, vertexFragment);
        // complete shader program creation
        gl.linkProgram(program);
        // check status if successful
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            return program;
        } else {
            gl.deleteProgram(program);
            throw new Error("Error during shader-program creation");
        }
    }

    private static getErrorReport(gl: WebGL2RenderingContext, shader: WebGLShader, source: string): ShaderReport {
        const glErrorMsg = gl.getShaderInfoLog(shader);
        if (glErrorMsg) {
            const codeLines = source.split(/\r\n|\n\r|\n|\r/);
            const errors = glErrorMsg
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
                errors: errors,
            };
        } else {
            return {
                source: source.split(/\r\n|\n\r|\n|\r/).map((l, i) => i + ":   " + l),
                errors: [],
            };
        }
    }


    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLProgram;
    private readonly debugName: string;


    constructor(gl: WebGL2RenderingContext, handle: WebGLProgram, debugName?: string) {
        this.gl = gl;
        this.handle = handle;
        this.debugName = debugName ? debugName : "noname";
    }

    /**
     * Binds this program
     */
    public use() {
        this.gl.useProgram(this.handle);
    }

    /**
     * Delete this program
     */
    public dispose() {
        if (this.handle) {
            this.gl.deleteProgram(this.handle);
        }
    }

    /**
     * Set the value of the attribute with the given name. This program and the buffer with the data must be bound first.
     */
    public setAttribute(
        name: string,
        type: ShaderAttributeType,
        amountComponents: number,
        normalized: boolean,
        stride: number,
        offset: number,
        location?: GLint,
    ) {
        const loc = location === undefined ? this.getAttributeLocation(name) : location;
        if (loc != null) {
            this.gl.enableVertexAttribArray(loc);
            this.gl.vertexAttribPointer(
                loc,
                amountComponents,
                GLProgram.shaderAttributeTypeToGLType(type),
                normalized,
                stride,
                offset,
            );
        } else {
            console.error("Could not set attribute '" + name + "'. Location not found.");
        }
    }

    /**
     * Sets the uniform with the given name to the given value(s). Program must be bound first.
     */
    public setUniform(name: string, type: ShaderUniformType, values: UniformValueType, location?: WebGLUniformLocation) {
        const loc = location === undefined ? this.getUniformLocation(name) : location;
        if (loc === null || loc === undefined) {
            console.error("Could not set uniform '" + name + "'. Location not found.");
            return;
        }
        const valuesArray: number[] | Float32Array = Array.isArray(values) ? values : (values instanceof Float32Array ? values : [values]);
        switch (type) {
            case ShaderUniformType.FLOAT:
                this.gl.uniform1f(loc, valuesArray[0]);
                break;
            case ShaderUniformType.FLOAT_ARRAY:
                this.gl.uniform1fv(loc, valuesArray);
                break;
            case ShaderUniformType.VEC2:
                this.gl.uniform2f(loc, valuesArray[0], valuesArray[1]);
                break;
            case ShaderUniformType.VEC2_ARRAY:
                this.gl.uniform2fv(loc, valuesArray);
                break;
            case ShaderUniformType.VEC3:
                this.gl.uniform3f(loc, valuesArray[0], valuesArray[1], valuesArray[2]);
                break;
            case ShaderUniformType.VEC3_ARRAY:
                this.gl.uniform3fv(loc, valuesArray);
                break;
            case ShaderUniformType.VEC4:
                this.gl.uniform4f(loc, valuesArray[0], valuesArray[1], valuesArray[2], valuesArray[3]);
                break;
            case ShaderUniformType.VEC4_ARRAY:
                this.gl.uniform4fv(loc, valuesArray);
                break;
            case ShaderUniformType.BOOL:
            case ShaderUniformType.SAMPLER_2D:
            case ShaderUniformType.SAMPLER_CUBE:
            case ShaderUniformType.INT:
                this.gl.uniform1i(loc, valuesArray[0]);
                break;
            case ShaderUniformType.SAMPLER_2D_ARRAY:
            case ShaderUniformType.SAMPLER_CUBE_ARRAY:
            case ShaderUniformType.INT_ARRAY:
                this.gl.uniform1iv(loc, valuesArray);
                break;
            case ShaderUniformType.BOOL_VEC2:
            case ShaderUniformType.INT_VEC2:
                this.gl.uniform2i(loc, valuesArray[0], valuesArray[1]);
                break;
            case ShaderUniformType.INT_VEC2_ARRAY:
                this.gl.uniform2iv(loc, valuesArray);
                break;
            case ShaderUniformType.BOOL_VEC3:
            case ShaderUniformType.INT_VEC3:
                this.gl.uniform3i(loc, valuesArray[0], valuesArray[1], valuesArray[2]);
                break;
            case ShaderUniformType.INT_VEC3_ARRAY:
                this.gl.uniform3iv(loc, valuesArray);
                break;
            case ShaderUniformType.BOOL_VEC4:
            case ShaderUniformType.INT_VEC4:
                this.gl.uniform4i(loc, valuesArray[0], valuesArray[1], valuesArray[2], valuesArray[3]);
                break;
            case ShaderUniformType.INT_VEC4_ARRAY:
                this.gl.uniform4iv(loc, valuesArray);
                break;
            case ShaderUniformType.MAT2:
            case ShaderUniformType.MAT2_ARRAY:
                this.gl.uniformMatrix2fv(loc, false, valuesArray);
                break;
            case ShaderUniformType.MAT3:
            case ShaderUniformType.MAT3_ARRAY:
                this.gl.uniformMatrix3fv(loc, false, valuesArray);
                break;
            case ShaderUniformType.MAT4:
            case ShaderUniformType.MAT4_ARRAY:
                this.gl.uniformMatrix4fv(loc, false, valuesArray);
                break;
        }
    }

    /**
     * Get the location of the attribute with the given name
     */
    public getAttributeLocation(name: string): GLint | null {
        const location: GLint = this.gl.getAttribLocation(this.handle, name);
        if (location >= 0) {
            return location;
        } else {
            return null;
        }
    }

    /**
     * Get the location of the uniform with the given name
     */
    public getUniformLocation(name: string): WebGLUniformLocation | null {
        return this.gl.getUniformLocation(this.handle, name);
    }

    public getDebugName(): string {
        return this.debugName;
    }

    private static shaderAttributeTypeToGLType(type: ShaderAttributeType): GLenum {
        switch (type) {
            case ShaderAttributeType.BYTE:
                return WebGL2RenderingContext.BYTE;
            case ShaderAttributeType.SHORT:
                return WebGL2RenderingContext.SHORT;
            case ShaderAttributeType.U_BYTE:
                return WebGL2RenderingContext.UNSIGNED_BYTE;
            case ShaderAttributeType.U_SHORT:
                return WebGL2RenderingContext.UNSIGNED_SHORT;
            case ShaderAttributeType.FLOAT:
                return WebGL2RenderingContext.FLOAT;
            case ShaderAttributeType.HALF_FLOAT:
                return WebGL2RenderingContext.HALF_FLOAT;
        }
    }


    private static shaderAttributeTypeToBytes(type: ShaderAttributeType): number {
        switch (type) {
            case ShaderAttributeType.BYTE:
                return 1;
            case ShaderAttributeType.SHORT:
                return 2;
            case ShaderAttributeType.U_BYTE:
                return 1;
            case ShaderAttributeType.U_SHORT:
                return 2;
            case ShaderAttributeType.FLOAT:
                return 4;
            case ShaderAttributeType.HALF_FLOAT:
                return 2;
        }
    }

}