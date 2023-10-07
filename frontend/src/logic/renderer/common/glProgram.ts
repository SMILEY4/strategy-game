import {GLShaderType, GLUniformType, GLUniformValueType} from "./glTypes";
import {GLError} from "./glError";
import {GLDisposable} from "./glDisposable";
import {GLTexture} from "./glTexture";

export class GLProgram implements GLDisposable {

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLProgram;
    private readonly information: GLProgram.GLProgramInformation;

    constructor(gl: WebGL2RenderingContext, handle: WebGLProgram, information: GLProgram.GLProgramInformation) {
        this.gl = gl;
        this.handle = handle;
        this.information = information;
    }

    public getInformation(): GLProgram.GLProgramInformation {
        return this.information;
    }

    public use() {
        this.gl.useProgram(this.handle);
        GLError.check(this.gl, "useProgram", "using program");
    }

    public dispose() {
        this.gl.deleteProgram(this.handle);
        GLError.check(this.gl, "deleteProgram", "disposing program");
    }

    public setUniform(name: string, type: GLUniformType, values: GLUniformValueType) {
        const information = this.information.uniforms.find(u => u.name === name);
        if (information) {
            this.setUniformValue(information.location, type, values);
        }
    }

    private uniformValueAsArray(values: GLUniformValueType): number[] | Float32Array {
        if (Array.isArray(values)) {
            return values;
        } else if (values instanceof Float32Array) {
            return values;
        } else if (values instanceof GLTexture) {
            return [values.getLastBoundTextureUnit()];
        } else {
            return [values];
        }
    }

    private setUniformValue(location: WebGLUniformLocation, type: GLUniformType, values: GLUniformValueType) {
        const valuesArray: number[] | Float32Array = this.uniformValueAsArray(values);
        switch (type) {
            case GLUniformType.FLOAT:
                this.gl.uniform1f(location, valuesArray[0]);
                break;
            case GLUniformType.FLOAT_ARRAY:
                this.gl.uniform1fv(location, valuesArray);
                break;
            case GLUniformType.VEC2:
                this.gl.uniform2f(location, valuesArray[0], valuesArray[1]);
                break;
            case GLUniformType.VEC2_ARRAY:
                this.gl.uniform2fv(location, valuesArray);
                break;
            case GLUniformType.VEC3:
                this.gl.uniform3f(location, valuesArray[0], valuesArray[1], valuesArray[2]);
                break;
            case GLUniformType.VEC3_ARRAY:
                this.gl.uniform3fv(location, valuesArray);
                break;
            case GLUniformType.VEC4:
                this.gl.uniform4f(location, valuesArray[0], valuesArray[1], valuesArray[2], valuesArray[3]);
                break;
            case GLUniformType.VEC4_ARRAY:
                this.gl.uniform4fv(location, valuesArray);
                break;
            case GLUniformType.BOOL:
            case GLUniformType.SAMPLER_2D:
            case GLUniformType.SAMPLER_CUBE:
            case GLUniformType.INT:
                this.gl.uniform1i(location, valuesArray[0]);
                break;
            case GLUniformType.SAMPLER_2D_ARRAY:
            case GLUniformType.SAMPLER_CUBE_ARRAY:
            case GLUniformType.INT_ARRAY:
                this.gl.uniform1iv(location, valuesArray);
                break;
            case GLUniformType.BOOL_VEC2:
            case GLUniformType.INT_VEC2:
                this.gl.uniform2i(location, valuesArray[0], valuesArray[1]);
                break;
            case GLUniformType.INT_VEC2_ARRAY:
                this.gl.uniform2iv(location, valuesArray);
                break;
            case GLUniformType.BOOL_VEC3:
            case GLUniformType.INT_VEC3:
                this.gl.uniform3i(location, valuesArray[0], valuesArray[1], valuesArray[2]);
                break;
            case GLUniformType.INT_VEC3_ARRAY:
                this.gl.uniform3iv(location, valuesArray);
                break;
            case GLUniformType.BOOL_VEC4:
            case GLUniformType.INT_VEC4:
                this.gl.uniform4i(location, valuesArray[0], valuesArray[1], valuesArray[2], valuesArray[3]);
                break;
            case GLUniformType.INT_VEC4_ARRAY:
                this.gl.uniform4iv(location, valuesArray);
                break;
            case GLUniformType.MAT2:
            case GLUniformType.MAT2_ARRAY:
                this.gl.uniformMatrix2fv(location, false, valuesArray);
                break;
            case GLUniformType.MAT3:
            case GLUniformType.MAT3_ARRAY:
                this.gl.uniformMatrix3fv(location, false, valuesArray);
                break;
            case GLUniformType.MAT4:
            case GLUniformType.MAT4_ARRAY:
                this.gl.uniformMatrix4fv(location, false, valuesArray);
                break;
        }
        GLError.check(this.gl, "uniform[...]", "setting program uniform value");
    }

}


export namespace GLProgram {

    export interface GLProgramInformation {
        attributes: GLProgramAttribute[],
        uniforms: GLProgramUniform[],
    }

    export interface GLProgramAttribute {
        name: string,
        location: GLint
    }

    export interface GLProgramUniform {
        name: string,
        location: WebGLUniformLocation
    }

    export function create(gl: WebGL2RenderingContext, srcVertex: string, srcFragment: string) {
        const shaderVertex = createShader(gl, GLShaderType.VERTEX, srcVertex);
        const shaderFragment = createShader(gl, GLShaderType.FRAGMENT, srcFragment);
        const program = createProgram(gl, shaderVertex, shaderFragment);
        const uniforms = getUniforms(gl, program);
        const attributes = getAttributes(gl, program);
        const information = {uniforms: uniforms, attributes: attributes};
        return new GLProgram(gl, program, information);
    }


    function createShader(gl: WebGL2RenderingContext, type: GLShaderType, source: string): WebGLShader {
        // create a new shader handle
        const shader = gl.createShader(type.glEnum);
        GLError.check(gl, "createShader", "creating shader (" + type.displayString + ")");
        if (!shader) {
            throw new Error("Could not create shader (" + type.displayString + ")");
        }

        // upload shader source code
        gl.shaderSource(shader, source);
        GLError.check(gl, "shaderSource", "uploading shader source (" + type.displayString + ")");

        // compile shader
        gl.compileShader(shader);
        GLError.check(gl, "compileShader", "compiling shader (" + type.displayString + ")");

        // check status if successful
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        } else {
            gl.deleteShader(shader);
            GLError.check(gl, "deleteShader", "deleting failed shader (" + type.displayString + ")");
            throw new Error("Failed to create shader (" + type.displayString + ")");
        }
    }

    function createProgram(gl: WebGL2RenderingContext, shaderVertex: WebGLShader, shaderFragment: WebGLShader): WebGLProgram {
        // create new program handle
        const program = gl.createProgram();
        GLError.check(gl, "createProgram", "creating program");
        if (!program) {
            throw new Error("Could not create program");
        }

        // attach vertex and fragment shaders to program
        gl.attachShader(program, shaderVertex);
        GLError.check(gl, "attachShader", "attaching vertex shader");
        gl.attachShader(program, shaderFragment);
        GLError.check(gl, "attachShader", "attaching fragment shader");

        //complete program creation
        gl.linkProgram(program);
        GLError.check(gl, "linkProgram", "linking program");

        // check status if successful
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            return program;
        } else {
            gl.deleteProgram(program);
            GLError.check(gl, "deleteProgram", "deleting failed program");
            throw new Error("Error during shader-program creation");
        }
    }

    function getUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): GLProgramUniform[] {
        const uniforms: GLProgramUniform[] = [];

        const amount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        GLError.check(gl, "getProgramParameter", "get amount of (active) uniforms");

        for (let i = 0; i < amount; i++) {
            const uniform = gl.getActiveUniform(program, i);
            GLError.check(gl, "getActiveUniform", "get information about (active) uniform");

            if (uniform) {
                const location = gl.getUniformLocation(program, uniform.name);
                GLError.check(gl, "getUniformLocation", "getting program uniform location");
                if (location === null) {
                    throw new Error("Could not get location for uniform " + uniform.name);
                }
                uniforms.push({
                    name: uniform.name,
                    location: location,
                });
            }

        }

        return uniforms;
    }

    function getAttributes(gl: WebGL2RenderingContext, program: WebGLProgram): GLProgramAttribute[] {
        const attributes: GLProgramAttribute[] = [];

        const amount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        GLError.check(gl, "getProgramParameter", "get amount of (active) attributes");

        for (let i = 0; i < amount; i++) {
            const attribute = gl.getActiveAttrib(program, i);
            GLError.check(gl, "getActiveAttrib", "get information about (active) attribute");

            if (attribute) {
                const location = gl.getAttribLocation(program, attribute.name);
                GLError.check(gl, "getAttribLocation", "getting program attribute location");
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

}