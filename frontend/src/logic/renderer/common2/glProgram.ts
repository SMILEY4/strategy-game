import {GLShaderType} from "./glTypes";
import {GLError} from "./glError";

export class GLProgram {

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLProgram;
    private readonly information: GLProgram.GLProgramInformation;

    constructor(gl: WebGL2RenderingContext, handle: WebGLProgram, information: GLProgram.GLProgramInformation) {
        this.gl = gl;
        this.handle = handle;
        this.information = information;
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