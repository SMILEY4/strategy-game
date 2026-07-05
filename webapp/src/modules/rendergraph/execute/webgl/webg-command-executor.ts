import {type GLUniformValueType} from "@modules/rendergraph/webgl/gl-program.ts";
import {GlFramebuffer} from "@modules/rendergraph/webgl/gl-framebuffer.ts";
import {mat4, vec3} from "gl-matrix";
import {GlError} from "@modules/rendergraph/webgl/gl-error.ts";
import type {ValueEntry, WebGlCommand} from "@modules/rendergraph/compile/webgl/webgl-compiler.ts";
import {WebGlExecutionContext} from "@modules/rendergraph/execute/webgl/webgl-execution-context.ts";
import {assertExhaustive} from "@modules/utilities/assert-exhaustive.ts";
import {subKey} from "@modules/rendergraph/execute/webgl/webgl-constants.ts";


/** Execute a list of compiled WebGL commands against the given execution context. */
export function executeWebGlCommands(commands: WebGlCommand[], context: WebGlExecutionContext) {
    for (let i = 0, n = commands.length; i < n; i++) {
        try {
            execute(commands[i], context);
        } catch (error) {
            console.error("Failed to execute webgl command", commands[i], context.getResources())
            throw error;
        }
    }
}

function execute(command: WebGlCommand, context: WebGlExecutionContext) {
    switch (command.type) {
        case "USE_SHADER": {
            context.getProgram(command.id).use();
            return;
        }

        case "BIND_FRAMEBUFFER": {
            context.getFramebuffer(command.id).bind();
            return;
        }

        case "UNBIND_FRAMEBUFFER": {
            GlFramebuffer.unbind(context.getRenderingContext());
            return;
        }

        case "RESIZE_FRAMEBUFFER": {
            if (context.isDirty(command.refSize)) {
                const framebuffer = context.getFramebuffer(command.id);
                const size = context.getData<[number, number]>(command.refSize);
                framebuffer.resize(size[0], size[1], false);
            }
            return;
        }

        case "BIND_VAO": {
            context.getVertexArray(command.id).bind();
            return;
        }

        case "BIND_TEXTURE": {
            context.getTexture(command.id).bind(command.unit);
            return;
        }

        case "BIND_TEXTURE_REF": {
            const textureId = context.getData<string>(command.idRef);
            context.getTexture(textureId).bind(command.unit);
            return;
        }

        case "BIND_TEXTURE_FRAMEBUFFER": {
            context.getFramebuffer(command.id).bindTexture(command.unit);
            return;
        }

        case "SET_UNIFORM": {
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

        case "DRAW": {
            const gl = context.getRenderingContext();
            const vertexCount = context.getVertexBufferElementCount(command.refVertexCount);
            gl.drawArrays(command.mode, 0, vertexCount);
            GlError.check(gl, "drawArrays", "drawing");
            return;
        }

        case "DRAW_INSTANCED": {
            const gl = context.getRenderingContext();
            const vertexCount = context.getVertexBufferElementCount(command.refVertexCount);
            const instanceCount = context.getVertexBufferElementCount(command.refInstanceCount);
            gl.drawArraysInstanced(command.mode, 0, vertexCount, instanceCount);
            GlError.check(gl, "drawArraysInstanced", "drawing instanced");
            return;
        }

        case "LOAD_EXTERNAL_DATA": {
            const prev = context.getData(command.ref)
            if(!context.isInitialized(command.ref) || command.checkChanged(prev)) {
                context.setData(command.ref, command.func());
            }
            return;
        }

        case "TRANSFORM_DATA": {
            if (isAnyDirty(context, ...command.args) || !context.isInitialized(command.refOut)) {
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

        case "TRANSFORM_DATA_MULTI_OUT": {
            if (isAnyDirty(context, ...command.args) || !context.isInitialized(command.refOut)) {
                context.setInitialized(command.refOut);
                const args = command.args.map(arg => {
                    if (arg.type === "const") return arg.value;
                    if (arg.type === "ref") return context.getData(arg.ref);
                });
                const result = command.func(...(args as Parameters<typeof command.func>));
                Object.entries(result).forEach(([key, value]) => {
                    if (value != null) {
                        context.setData(subKey(command.refOut, key), value);
                    }
                });
            }
            return;
        }

        case "TRANSFORM_DATA_VERTEX_OUT": {
            if (isAnyDirty(context, ...command.args) || !context.isInitialized(command.refOut)) {
                context.setInitialized(command.refOut);
                const args = command.args.map(arg => {
                    if (arg.type === "const") return arg.value;
                    if (arg.type === "ref") return context.getData(arg.ref);
                });
                const result = command.func(...(args as Parameters<typeof command.func>));
                Object.entries(result).forEach(([key, value]) => {
                    if (value != null) {
                        const bufferKey = subKey(command.refOut, key);
                        const buffer = context.getVertexBuffer(bufferKey);
                        buffer.setData(value.data, true);
                        context.setVertexBufferElementCount(bufferKey, value.count);
                    }
                });
            }
            return;
        }

        case "DOWNLOAD_WASM_VERTEX_DATA": {
            if(isAnyDirty(context, command.refWasmData) || !context.isInitialized(command.refOut)) {
                context.setInitialized(command.refOut);
                const value = command.func()
                const buffer = context.getVertexBuffer(command.refOut);
                buffer.setData(value.data, true);
                context.setVertexBufferElementCount(command.refOut, value.count);
            }
            return;
        }

        case "SELECT_TEXTURE": {
            if (isAnyDirty(context, ...command.args) || !context.isInitialized(command.refOut)) {
                const args = command.args.map(arg => {
                    if (arg.type === "const") return arg.value;
                    if (arg.type === "ref") return context.getData(arg.ref);
                });
                const result = command.func(...(args as Parameters<typeof command.func>));
                context.setData(command.refOut, result);
            }
            return;
        }

        case "CALCULATE_PERSPECTIVE_PROJECTION": {
            if (isAnyDirty(context, command.fov, command.size, command.near, command.far) || !context.isInitialized(command.ref)) {
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

        case "CALCULATE_ORTHOGRAPHIC_PROJECTION": {
            if (isAnyDirty(context, command.size, command.near, command.far) || !context.isInitialized(command.ref)) {
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

        case "CALCULATE_3D_VIEW": {
            if (isAnyDirty(context, command.position, command.direction, command.up) || !context.isInitialized(command.ref)) {
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

        case "CALCULATE_VIEW_PROJECTION": {
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

        case "SET_VIEWPORT": {
            const gl = context.getRenderingContext();
            const size = command.size.type === "const"
                ? command.size.value
                : context.getData<[number, number]>(command.size.ref);
            gl.viewport(0, 0, size[0], size[1]);
            return;
        }

        case "CLEAR_BUFFER": {
            const gl = context.getRenderingContext();
            const clearColor = command.clearColor.type === "const"
                ? command.clearColor.value
                : context.getData<[number, number, number, number]>(command.clearColor.ref);
            gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            return;
        }

        case "SET_DEPTH_TESTING": {
            const gl = context.getRenderingContext();
            if (command.enabled) {
                gl.enable(gl.DEPTH_TEST);
            } else {
                gl.disable(gl.DEPTH_TEST);
            }
            return;
        }

        case "DOWNLOAD_WASM_DATA": {
            if(context.isDirty(command.wasmDataRef) || !context.isInitialized(command.ref)) {
                context.setData(command.ref, command.func());
            }
            return;
        }

        case "UPLOAD_WASM_DATA": {
            if(isAnyDirty(context, command.sourceRef) || !context.isInitialized(command.ref)) {
                const data = getDataHelper(context, command.sourceRef)
                command.func(data)
                context.setInitialized(command.ref)
                context.setDirty(command.ref)
            }
            return;
        }

        case "EXECUTE_WASM": {
            if(isAnyDirty(context, ...command.dataRefs, ...command.wasmRefs)) {
                const args = command.dataRefs.map(arg => {
                    if (arg.type === "const") return arg.value;
                    if (arg.type === "ref") return context.getData(arg.ref);
                });
                const result = command.func(...(args as Parameters<typeof command.func>));
                Object.entries(result).forEach(([key, modified]) => {
                    if(modified) {
                        const wasmDataNodeRefs = command.outKeyWasmDataMapping[key]
                        if(wasmDataNodeRefs) {
                            wasmDataNodeRefs.forEach(ref => context.setDirty(ref))
                        }
                    }
                })
            }
            return;
        }

        default:
            assertExhaustive(command);
    }
}

function isAnyDirty(context: WebGlExecutionContext, ...args: (ValueEntry | string)[]): boolean {
    return args.some(arg => {
        if(typeof arg === "string") {
            return context.isDirty(arg)
        } else {
            return arg.type === "ref" && context.isDirty(arg.ref)
        }
    });
}

function getDataHelper<T>(context: WebGlExecutionContext, ref: ValueEntry): T {
    if(ref.type === "const") {
        return ref.value as T
    }
    if(ref.type === "ref") {
        return context.getData(ref.ref);
    }
    assertExhaustive(ref)
}