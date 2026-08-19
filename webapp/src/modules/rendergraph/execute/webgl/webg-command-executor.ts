import {type GLUniformValueType} from "@modules/rendergraph/webgl/gl-program.ts";
import GlFramebuffer from "@modules/rendergraph/webgl/gl-framebuffer.ts";
import {mat4, vec3} from "gl-matrix";
import {GlError} from "@modules/rendergraph/webgl/gl-error.ts";
import type {WebGlCommand} from "@modules/rendergraph/compile/webgl/webgl-command.ts";
import {WebGlExecutionContext} from "@modules/rendergraph/execute/webgl/webgl-execution-context.ts";
import {assertExhaustive} from "@modules/utilities/assert-exhaustive.ts";
import {subResourceKey} from "@modules/rendergraph/execute/webgl/webgl-constants.ts";
import type {ValueEntry} from "@modules/rendergraph/compile/value-entry.ts";

/** Matrix that negates the clip-space Y axis (see CALCULATE_VIEW_PROJECTION). */
const MATRIX_FLIP_Y = mat4.fromScaling(mat4.create(), vec3.fromValues(1, -1, 1));


/** Execute a list of compiled WebGL commands against the given execution context. */
export function executeWebGlCommands(commands: WebGlCommand[], context: WebGlExecutionContext) {
    for (let i = 0, n = commands.length; i < n; i++) {
        try {
            execute(commands[i], context);
        } catch (error) {
            console.error("Failed to execute webgl command", commands[i], context.getResources());
            throw error;
        }
    }
}

function execute(command: WebGlCommand, context: WebGlExecutionContext) {
    switch (command.type) {
        case "USE_SHADER": {
            context.getProgram(command.shaderId).use();
            return;
        }

        case "BIND_FRAMEBUFFER": {
            const framebuffer = context.getFramebuffer(command.framebufferId);
            framebuffer.bind()
            return;
        }

        case "UNBIND_FRAMEBUFFER": {
            GlFramebuffer.unbind(context.getRenderingContext());
            return;
        }

        case "RESIZE_FRAMEBUFFER": {
            if (context.isDirty(command.sizeRef) || (command.scale.type === "ref" && context.isDirty(command.scale.ref))) {
                const framebuffer = context.getFramebuffer(command.framebufferId);
                const size = context.getData<[number, number]>(command.sizeRef);
                const scale = command.scale.type === "const"
                    ? command.scale.value
                    : context.getData<number>(command.scale.ref)
                framebuffer.resize(size[0] * scale, size[1] * scale, false);
            }
            return;
        }

        case "BIND_VAO": {
            context.getVertexArray(command.vaoId).bind();
            return;
        }

        case "BIND_TEXTURE": {
            context.getTexture(command.textureId).bind(command.textureUnit);
            return;
        }

        case "BIND_TEXTURE_REF": {
            const textureId = context.getData<string>(command.textureIdRef);
            context.getTexture(textureId).bind(command.textureUnit);
            return;
        }

        case "BIND_TEXTURE_FRAMEBUFFER": {
            context.getFramebuffer(command.framebufferId).bindTexture(command.attachmentName, command.textureUnit);
            return;
        }

        case "SET_UNIFORM": {
            const program = context.getProgram(command.shaderId);
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
            const vertexCount = context.getVertexBufferElementCount(command.vertexCountRef);

            if (command.blend === null) {
                gl.enable(gl.BLEND);
                gl.blendFuncSeparate(
                    gl.SRC_ALPHA,
                    gl.ONE_MINUS_SRC_ALPHA,
                    gl.ONE,
                    gl.ONE_MINUS_SRC_ALPHA,
                );
            } else {
                gl.enable(gl.BLEND);
                command.blend(gl);
            }

            gl.drawArrays(command.mode, 0, vertexCount);
            GlError.check(gl, "drawArrays", "drawing");
            return;
        }

        case "DRAW_INSTANCED": {
            const gl = context.getRenderingContext();

            if (command.blend === null) {
                gl.enable(gl.BLEND);
                gl.blendFuncSeparate(
                    gl.SRC_ALPHA,
                    gl.ONE_MINUS_SRC_ALPHA,
                    gl.ONE,
                    gl.ONE_MINUS_SRC_ALPHA,
                );
            } else {
                gl.enable(gl.BLEND);
                command.blend(gl);
            }

            const vertexCount = context.getVertexBufferElementCount(command.vertexCountRef);
            const instanceCount = context.getVertexBufferElementCount(command.instanceCountRef);
            gl.drawArraysInstanced(command.mode, 0, vertexCount, instanceCount);
            GlError.check(gl, "drawArraysInstanced", "drawing instanced");
            return;
        }

        case "LOAD_EXTERNAL_DATA": {
            const prev = context.getData(command.outputRef);
            if (!context.isInitialized(command.outputRef) || command.checkChanged(prev)) {
                context.setData(command.outputRef, command.fetch());
            }
            return;
        }

        case "TRANSFORM_DATA": {
            if (isAnyDirty(context, ...command.inputRefs) || !context.isInitialized(command.outputRef)) {
                const args = command.inputRefs.map(arg => {
                    if (arg.type === "const") return arg.value;
                    if (arg.type === "ref") return context.getData(arg.ref);
                });
                const result = command.func(...(args as Parameters<typeof command.func>));
                if (command.checkChanged(context.getData(command.outputRef), result)) {
                    context.setData(command.outputRef, result);
                }
            }
            return;
        }

        case "TRANSFORM_DATA_MULTI_OUT": {
            if (isAnyDirty(context, ...command.inputRefs) || !context.isInitialized(command.outputRef)) {
                context.setInitialized(command.outputRef);
                const args = command.inputRefs.map(arg => {
                    if (arg.type === "const") return arg.value;
                    if (arg.type === "ref") return context.getData(arg.ref);
                });
                const result = command.func(...(args as Parameters<typeof command.func>));
                Object.entries(result).forEach(([key, value]) => {
                    if (value != null) {
                        context.setData(subResourceKey(command.outputRef, key), value);
                    }
                });
            }
            return;
        }

        case "TRANSFORM_DATA_VERTEX_OUT": {
            if (isAnyDirty(context, ...command.inputRefs) || !context.isInitialized(command.outputRef)) {
                context.setInitialized(command.outputRef);
                const args = command.inputRefs.map(arg => {
                    if (arg.type === "const") return arg.value;
                    if (arg.type === "ref") return context.getData(arg.ref);
                });
                const result = command.func(...(args as Parameters<typeof command.func>));
                Object.entries(result).forEach(([key, value]) => {
                    if (value != null) {
                        const bufferKey = subResourceKey(command.outputRef, key);
                        const buffer = context.getVertexBuffer(bufferKey);
                        buffer.setData(value.data, true);
                        context.setVertexBufferElementCount(bufferKey, value.count);
                    }
                });
            }
            return;
        }

        case "DOWNLOAD_WASM_VERTEX_DATA": {
            if (isAnyDirty(context, command.wasmDataRef) || !context.isInitialized(command.outputRef)) {
                context.setInitialized(command.outputRef);
                const value = command.fetch();
                const buffer = context.getVertexBuffer(command.outputRef);
                buffer.setData(value.data, true);
                context.setVertexBufferElementCount(command.outputRef, value.count);
            }
            return;
        }

        case "SELECT_TEXTURE": {
            if (isAnyDirty(context, ...command.inputRefs) || !context.isInitialized(command.outputRef)) {
                const args = command.inputRefs.map(arg => {
                    if (arg.type === "const") return arg.value;
                    if (arg.type === "ref") return context.getData(arg.ref);
                });
                const result = command.func(...(args as Parameters<typeof command.func>));
                context.setData(command.outputRef, result);
            }
            return;
        }

        case "CALCULATE_PERSPECTIVE_PROJECTION": {
            if (isAnyDirty(context, command.fov, command.size, command.near, command.far) || !context.isInitialized(command.outputRef)) {
                let matrix = context.getData<mat4>(command.outputRef);
                if (!matrix) {
                    matrix = mat4.create();
                    context.setData(command.outputRef, matrix);
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
                context.setDirty(command.outputRef);
            }
            return;
        }

        case "CALCULATE_ORTHOGRAPHIC_PROJECTION": {
            if (isAnyDirty(context, command.size, command.near, command.far) || !context.isInitialized(command.outputRef)) {
                let matrix = context.getData<mat4>(command.outputRef);
                if (!matrix) {
                    matrix = mat4.create();
                    context.setData(command.outputRef, matrix);
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
                context.setDirty(command.outputRef);
            }
            return;
        }

        case "CALCULATE_3D_VIEW": {
            if (isAnyDirty(context, command.position, command.direction, command.up) || !context.isInitialized(command.outputRef)) {
                let matrix = context.getData<mat4>(command.outputRef);
                if (!matrix) {
                    matrix = mat4.create();
                    context.setData(command.outputRef, matrix);
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
                context.setDirty(command.outputRef);
            }
            return;
        }

        case "CALCULATE_VIEW_PROJECTION": {
            if (context.isDirty(command.viewRef) || context.isDirty(command.projectionRef) || !context.isInitialized(command.outputRef)) {
                let matrixViewProjection = context.getData<mat4>(command.outputRef);
                if (!matrixViewProjection) {
                    matrixViewProjection = mat4.create();
                    context.setData(command.outputRef, matrixViewProjection);
                }
                const matrixView = context.getData<mat4>(command.viewRef);
                const matrixProjection = context.getData<mat4>(command.projectionRef);
                mat4.multiply(matrixViewProjection, matrixProjection, matrixView);
                // This project uses image-style Y-down screen coordinates: negate clip-space Y here
                // so every shader can use the plain `u_camera * vertex` transform. Keep the picking
                // unprojection in camera-utils in sync with this flip.
                mat4.multiply(matrixViewProjection, MATRIX_FLIP_Y, matrixViewProjection);
                context.setDirty(command.outputRef);
            }
            return;
        }

        case "SET_VIEWPORT": {
            const gl = context.getRenderingContext();
            const size = command.size.type === "const"
                ? command.size.value
                : context.getData<[number, number]>(command.size.ref);
            const scale = command.scale.type === "const"
                ? command.scale.value
                : context.getData<number>(command.scale.ref)
            gl.viewport(0, 0, size[0] * scale, size[1] * scale);
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
            if (context.isDirty(command.wasmDataRef) || !context.isInitialized(command.outputRef)) {
                context.setData(command.outputRef, command.fetch());
            }
            return;
        }

        case "UPLOAD_WASM_DATA": {
            if (isAnyDirty(context, command.sourceRef) || !context.isInitialized(command.sourceRef)) {
                const data = getDataHelper(context, command.sourceRef);
                command.upload(data);
                context.setInitialized(command.wasmDataRef);
                context.setDirty(command.wasmDataRef);
            }
            return;
        }

        case "EXECUTE_WASM": {
            if (isAnyDirty(context, ...command.dataInputRefs, ...command.wasmInputRefs)) {
                const args = command.dataInputRefs.map(arg => {
                    if (arg.type === "const") return arg.value;
                    if (arg.type === "ref") return context.getData(arg.ref);
                });
                const result = command.func(...(args as Parameters<typeof command.func>));
                Object.entries(result).forEach(([key, modified]) => {
                    if (modified) {
                        const wasmDataNodeRefs = command.outputKeyMapping[key];
                        if (wasmDataNodeRefs) {
                            wasmDataNodeRefs.forEach(ref => context.setDirty(ref));
                        }
                    }
                });
            }
            return;
        }

        default:
            assertExhaustive(command);
    }
}

function isAnyDirty(context: WebGlExecutionContext, ...args: (ValueEntry | string)[]): boolean {
    return args.some(arg => {
        if (typeof arg === "string") {
            return context.isDirty(arg);
        } else {
            return arg.type === "ref" && context.isDirty(arg.ref);
        }
    });
}

function getDataHelper<T>(context: WebGlExecutionContext, ref: ValueEntry): T {
    if (ref.type === "const") {
        return ref.value as T;
    }
    if (ref.type === "ref") {
        return context.getData(ref.ref);
    }
    assertExhaustive(ref);
}