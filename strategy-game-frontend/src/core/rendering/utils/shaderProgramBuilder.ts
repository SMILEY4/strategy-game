import {ShaderProgramData} from "./shaderProgram";

export namespace ShaderProgramBuilder {


    interface ShaderReport {
        source: string[],
        errors: ({
            lineNumber: number,
            line: string
            error: string
        })[]
    }


    export function build(gl: WebGL2RenderingContext, data: ShaderProgramData): WebGLProgram {
        const shaderVertex = createShader(gl, "vertex", data.sourceVertex, data.debugName);
        const shaderFragment = createShader(gl, "fragment", data.sourceFragment, data.debugName);
        return createShaderProgram(gl, shaderVertex, shaderFragment);
    }


    function createShader(gl: WebGL2RenderingContext, type: "vertex" | "fragment", source: string, debugName: string | undefined): WebGLShader {
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
            const errorReport = getErrorReport(gl, shader, source);
            gl.deleteShader(shader);
            console.warn("Error during " + type + " shader creation (name=" + debugName + ")", errorReport)
            throw new Error("Failed to create shader (name=" + debugName + ")");
        }
    }


    function createShaderProgram(gl: WebGL2RenderingContext, shaderVertex: WebGLShader, vertexFragment: WebGLShader): WebGLProgram {
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

    function getErrorReport(gl: WebGL2RenderingContext, shader: WebGLShader, source: string): ShaderReport {
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
                source: codeLines.map((l,i) => i + ":   " + l),
                errors: errors
            };
        } else {
            return {
                source: source.split(/\r\n|\n\r|\n|\r/).map((l,i) => i + ":   " + l),
                errors: []
            };
        }

    }


}