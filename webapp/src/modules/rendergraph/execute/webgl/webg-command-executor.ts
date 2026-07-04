import {type GLUniformValueType} from "@modules/rendergraph/webgl/gl-program.ts";
import {GlFramebuffer} from "@modules/rendergraph/webgl/gl-framebuffer.ts";
import {mat4, vec3} from "gl-matrix";
import {GlError} from "@modules/rendergraph/webgl/gl-error.ts";
import type {ValueEntry, WebGlCommand} from "@modules/rendergraph/compile/webgl/webgl-compiler.ts";
import {WebGlExecutionContext} from "@modules/rendergraph/execute/webgl/webgl-execution-context.ts";
import {assertExhaustive} from "@modules/utilities/assert-exhaustive.ts";


/** Execute a list of compiled WebGL commands against the given execution context. */
export function executeWebGlCommands(commands: WebGlCommand[], context: WebGlExecutionContext) {
    for (let i = 0, n = commands.length; i < n; i++) {
        execute(commands[i], context);
    }
}

function execute(command: WebGlCommand, context: WebGlExecutionContext) {

    if (command.type === "USE_SHADER") {
        const program = context.getProgram(command.id);
        program.use();
        return;
    }

    if (command.type === "BIND_FRAMEBUFFER") {
        const framebuffer = context.getFramebuffer(command.id);
        framebuffer.bind();
        return;
    }

    if (command.type === "UNBIND_FRAMEBUFFER") {
        GlFramebuffer.unbind(context.getRenderingContext());
        return;
    }

    if (command.type === "RESIZE_FRAMEBUFFER") {
        if (context.isDirty(command.refSize)) {
            const framebuffer = context.getFramebuffer(command.id);
            const size = context.getData<[number, number]>(command.refSize);
            framebuffer.resize(size[0], size[1], false);
        }
        return;
    }

    if (command.type === "BIND_VAO") {
        const vao = context.getVertexArray(command.id);
        vao.bind();
        return;
    }

    if (command.type === "BIND_TEXTURE") {
        const texture = context.getTexture(command.id);
        texture.bind(command.unit);
        return;
    }

    if (command.type === "BIND_TEXTURE_REF") {
        const textureId = context.getData<string>(command.idRef);
        const texture = context.getTexture(textureId);
        texture.bind(command.unit);
        return;
    }

    if (command.type === "BIND_TEXTURE_FRAMEBUFFER") {
        const framebuffer = context.getFramebuffer(command.id);
        framebuffer.bindTexture(command.unit);
        return;
    }

    if (command.type === "SET_UNIFORM") {
        const program = context.getProgram(command.programId);
        if (command.value.type === "const") {
            program.setUniform(command.name, command.value.value as GLUniformValueType);
        }
        if (command.value.type === "ref") {
            const data = context.getData(command.value.ref);
            program.setUniform(command.name, data as GLUniformValueType);
        }
        return;
    }

    if (command.type === "DRAW") {
        const gl = context.getRenderingContext();
        const vertexCount = context.getVertexBufferElementCount(command.refVertexCount);
        gl.drawArrays(command.mode, 0, vertexCount);
        GlError.check(gl, "drawArrays", "drawing");
        return;
    }

    if (command.type === "DRAW_INSTANCED") {
        const gl = context.getRenderingContext();
        const vertexCount = context.getVertexBufferElementCount(command.refVertexCount);
        const instanceCount = context.getVertexBufferElementCount(command.refInstanceCount);
        gl.drawArraysInstanced(command.mode, 0, vertexCount, instanceCount);
        GlError.check(gl, "drawArraysInstanced", "drawing instanced");
        return;
    }

    if (command.type === "LOAD_EXTERNAL_DATA") {
        const prev = context.getData(command.ref)
        if(command.checkChanged(prev) || !context.isInitialized(command.ref)) {
            context.setData(command.ref, command.func());
        }
        return;
    }

    if (command.type === "TRANSFORM_DATA") {
        if (isAnyDirty(...command.args) || !context.isInitialized(command.refOut)) {
            const args = command.args.map(arg => {
                if (arg.type === "const") return arg.value;
                if (arg.type === "ref") return context.getData(arg.ref);
            });
            const result = command.func(...(args as Parameters<typeof command.func>));
            if(command.checkChanged(context.getData(command.refOut), result)) {
                context.setData(command.refOut, result);
            }
        }
        return;
    }

    if (command.type === "TRANSFORM_DATA_MULTI_OUT") {
        if (isAnyDirty(...command.args) || !context.isInitialized(command.refOut)) {
            context.setInitialized(command.refOut);
            const args = command.args.map(arg => {
                if (arg.type === "const") return arg.value;
                if (arg.type === "ref") return context.getData(arg.ref);
            });
            const result = command.func(...(args as Parameters<typeof command.func>));
            Object.entries(result).forEach(([key, value]) => {
                if (value != null) {
                    context.setData(command.refOut + "#" + key, value);
                }
            });
        }
        return;
    }

    if (command.type === "TRANSFORM_DATA_VERTEX_OUT") {
        if (isAnyDirty(...command.args) || !context.isInitialized(command.refOut)) {
            context.setInitialized(command.refOut);
            const args = command.args.map(arg => {
                if (arg.type === "const") return arg.value;
                if (arg.type === "ref") return context.getData(arg.ref);
            });
            const result = command.func(...(args as Parameters<typeof command.func>));
            Object.entries(result).forEach(([key, value]) => {
                if (value != null) {
                    const buffer = context.getVertexBuffer(command.refOut + "#" + key);
                    buffer.setData(value.data, true);
                    context.setVertexBufferElementCount(command.refOut + "#" + key, value.count);
                }
            });
        }
        return;
    }

    if(command.type === "DOWNLOAD_WASM_VERTEX_DATA") {
        if(isAnyDirty(command.refWasmData) || !context.isInitialized(command.refOut)) {
            context.setInitialized(command.refOut);
            const value = command.func()
            const buffer = context.getVertexBuffer(command.refOut);
            buffer.setData(value.data, true);
            context.setVertexBufferElementCount(command.refOut, value.count);
        }
        return;
    }

    if (command.type === "SELECT_TEXTURE") {
        if (isAnyDirty(...command.args) || !context.isInitialized(command.refOut)) {
            const args = command.args.map(arg => {
                if (arg.type === "const") return arg.value;
                if (arg.type === "ref") return context.getData(arg.ref);
            });
            const result = command.func(...(args as Parameters<typeof command.func>));
            context.setData(command.refOut, result);
        }
        return;
    }

    if (command.type === "CALCULATE_PERSPECTIVE_PROJECTION") {
        if (isAnyDirty(command.fov, command.size, command.near, command.far) || !context.isInitialized(command.ref)) {
            let matrix = context.getData<mat4>(command.ref);
            if (!matrix) {
                matrix = mat4.create();
                context.setData(command.ref, matrix);
            }
            const fov = command.fov.type === "const"
                ? command.fov.value
                : context.getData<number>(command.fov.ref);
            const near = command.near.type === "const"
                ? command.near.value
                : context.getData<number>(command.near.ref);
            const far = command.far.type === "const"
                ? command.far.value
                : context.getData<number>(command.far.ref);
            const size = command.size.type === "const"
                ? command.size.value
                : context.getData<[number, number]>(command.size.ref);
            const aspectRatio = size[0] / size[1];
            mat4.perspective(matrix, fov, aspectRatio, near, far);
            context.setDirty(command.ref);
        }
        return;
    }

    if (command.type === "CALCULATE_ORTHOGRAPHIC_PROJECTION") {
        if (isAnyDirty(command.size, command.near, command.far) || !context.isInitialized(command.ref)) {
            let matrix = context.getData<mat4>(command.ref);
            if (!matrix) {
                matrix = mat4.create();
                context.setData(command.ref, matrix);
            }
            const near = command.near.type === "const"
                ? command.near.value
                : context.getData<number>(command.near.ref);
            const far = command.far.type === "const"
                ? command.far.value
                : context.getData<number>(command.far.ref);
            const size = command.size.type === "const"
                ? command.size.value
                : context.getData<[number, number]>(command.size.ref);
            const width = size[0];
            const height = size[1];
            mat4.ortho(matrix, -width / 2, width / 2, -height / 2, height / 2, near, far);
            context.setDirty(command.ref);
        }
        return;
    }

    if (command.type === "CALCULATE_3D_VIEW") {
        if (isAnyDirty(command.position, command.direction, command.up) || !context.isInitialized(command.ref)) {
            let matrix = context.getData<mat4>(command.ref);
            if (!matrix) {
                matrix = mat4.create();
                context.setData(command.ref, matrix);
            }
            const position = command.position.type === "const"
                ? command.position.value
                : context.getData<vec3>(command.position.ref);
            const direction = command.direction.type === "const"
                ? command.direction.value
                : context.getData<vec3>(command.direction.ref);
            const up = command.up.type === "const"
                ? command.up.value
                : context.getData<vec3>(command.up.ref);
            const target = vec3.fromValues(
                position[0] + direction[0],
                position[1] + direction[1],
                position[2] + direction[2],
            );
            mat4.lookAt(matrix, position, target, up);
            context.setDirty(command.ref);
        }
        return;
    }

    if (command.type === "CALCULATE_VIEW_PROJECTION") {
        if (context.isDirty(command.refView) || context.isDirty(command.refProjection) || !context.isInitialized(command.ref)) {
            let matrixViewProjection = context.getData<mat4>(command.ref);
            if (!matrixViewProjection) {
                matrixViewProjection = mat4.create();
                context.setData(command.ref, matrixViewProjection);
            }
            const matrixView = context.getData<mat4>(command.refView);
            const matrixProjection = context.getData<mat4>(command.refProjection);
            mat4.multiply(matrixViewProjection, matrixProjection, matrixView);
            context.setDirty(command.ref);
        }
        return;
    }

    if (command.type === "SET_VIEWPORT") {
        const gl = context.getRenderingContext();
        const size = command.size.type === "const"
            ? command.size.value
            : context.getData<[number, number]>(command.size.ref);
        gl.viewport(0, 0, size[0], size[1]);
        return;
    }

    if (command.type === "CLEAR_BUFFER") {
        const gl = context.getRenderingContext();
        const clearColor = command.clearColor.type === "const"
            ? command.clearColor.value
            : context.getData<[number, number, number, number]>(command.clearColor.ref);
        gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        return;
    }

    if (command.type === "SET_DEPTH_TESTING") {
        const gl = context.getRenderingContext();
        if (command.enabled) {
            gl.enable(gl.DEPTH_TEST);
        } else {
            gl.disable(gl.DEPTH_TEST);
        }
        return;
    }

    if(command.type === "DOWNLOAD_WASM_DATA") {
        if(context.isDirty(command.wasmDataRef) || !context.isInitialized(command.ref)) {
            context.setData(command.ref, command.func());
        }
        return
    }

    if(command.type === "UPLOAD_WASM_DATA") {
        if(isAnyDirty(command.sourceRef) || !context.isInitialized(command.ref)) {
            const data = getData(command.sourceRef)
            command.func(data)
            context.setInitialized(command.ref)
            context.setDirty(command.ref)
        }
        return
    }

    if(command.type === "EXECUTE_WASM") {
        if(isAnyDirty(...command.dataRefs, ...command.wasmRefs)) {
            const args = command.dataRefs.map(arg => {
                if (arg.type === "const") return arg.value;
                if (arg.type === "ref") return context.getData(arg.ref);
            });
            const result = command.func(args)
            Object.entries(result).forEach(([key, modified]) => {
                if(modified) {
                    const wasmDataNodeRefs = command.outKeyWasmDataMapping[key]
                    if(wasmDataNodeRefs) {
                        wasmDataNodeRefs.forEach(ref => context.setDirty(ref))
                    }
                }
            })
        }
        return
    }

    assertExhaustive(command);

    function isAnyDirty(...args: (ValueEntry | string)[]): boolean {
        return args.some(arg => {
            if(typeof arg === "string") {
                return context.isDirty(arg)
            } else {
                return arg.type === "ref" && context.isDirty(arg.ref)
            }
        });
    }

    function getData<T>(ref: ValueEntry): T {
        if(ref.type === "const") {
            return ref.value as T
        }
        if(ref.type === "ref") {
            return context.getData(ref.ref);
        }
        assertExhaustive(ref)
    }

}