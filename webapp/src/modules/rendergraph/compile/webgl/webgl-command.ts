import type {VertexDataResult} from "@modules/rendergraph/nodes/rg-node.transform-vertex-out.ts";
import type {vec3} from "gl-matrix";
import type {ValueEntry} from "@modules/rendergraph/compile/value-entry.ts";

/** A compiled WebGL command emitted by the render-graph compiler. */
export type WebGlCommand =

    /** Switch the active shader program. */
    | { type: "USE_SHADER", shaderId: string }

    /** Bind an offscreen framebuffer as the render target. */
    | { type: "BIND_FRAMEBUFFER", framebufferId: string }

    /** Unbind any framebuffer and render to the canvas. */
    | { type: "UNBIND_FRAMEBUFFER" }

    /** Resize a framebuffer if the referenced size value is dirty. */
    | { type: "RESIZE_FRAMEBUFFER", framebufferId: string, sizeRef: string, scale: ValueEntry<number> }

    /** Bind a vertex array object for subsequent draw calls. */
    | { type: "BIND_VAO", vaoId: string }

    /** Bind a texture to a specific texture unit. */
    | { type: "BIND_TEXTURE", textureId: string, textureUnit: number }

    /** Bind a texture whose key is stored in the data resource at {@link textureIdRef}. */
    | { type: "BIND_TEXTURE_REF", textureIdRef: string, textureUnit: number }

    /** Bind a framebuffer's attachment as a texture on the given unit. */
    | { type: "BIND_TEXTURE_FRAMEBUFFER", framebufferId: string, attachmentName: string, textureUnit: number }

    /** Set a uniform on the active shader program. */
    | { type: "SET_UNIFORM", shaderId: string, name: string, value: ValueEntry }

    /** Enable or disable depth testing. */
    | { type: "SET_DEPTH_TESTING", enabled: boolean }

    /** Issue a non-instanced draw call. */
    | { type: "DRAW", vertexCountRef: string, mode: GLenum, blend: null | ((gl: WebGL2RenderingContext) => void) }

    /** Issue an instanced draw call. */
    | { type: "DRAW_INSTANCED", vertexCountRef: string, instanceCountRef: string, mode: GLenum, blend: null | ((gl: WebGL2RenderingContext) => void) }

    /** Fetch external data and store it in the {@link outputRef} resource. */
    | { type: "LOAD_EXTERNAL_DATA", outputRef: string, fetch: () => unknown, checkChanged: (prev: unknown) => boolean }

    /** Evaluate a transform function and store the result if changed. */
    | {
        type: "TRANSFORM_DATA",
        inputRefs: ValueEntry[],
        outputRef: string,
        func: (args: unknown[]) => unknown | null,
        checkChanged: (prev: unknown, next: unknown) => boolean
    }

    /** Evaluate a multi-output transform and store each output under `outputRef + "#" + key`. */
    | {
        type: "TRANSFORM_DATA_MULTI_OUT",
        inputRefs: ValueEntry[],
        outputRef: string,
        func: (args: unknown[]) => Record<string, unknown | null>
    }

    /** Evaluate a vertex-output transform and upload to vertex buffers under `outputRef + "#" + key`. */
    | {
        type: "TRANSFORM_DATA_VERTEX_OUT",
        inputRefs: ValueEntry[],
        outputRef: string,
        func: (args: unknown[]) => Record<string, VertexDataResult | null>
    }

    /** Evaluate a selector function to dynamically choose a texture. */
    | { type: "SELECT_TEXTURE", inputRefs: ValueEntry[], outputRef: string, func: (args: unknown) => string }

    /** Compute a perspective projection matrix and store at {@link outputRef}. */
    | {
        type: "CALCULATE_PERSPECTIVE_PROJECTION",
        outputRef: string,
        size: ValueEntry<[number, number]>,
        fov: ValueEntry<number>,
        near: ValueEntry<number>,
        far: ValueEntry<number>
    }

    /** Compute an orthographic projection matrix and store at {@link outputRef}. */
    | {
        type: "CALCULATE_ORTHOGRAPHIC_PROJECTION",
        outputRef: string,
        size: ValueEntry<[number, number]>,
        near: ValueEntry<number>,
        far: ValueEntry<number>
    }

    /** Compute a 3D view matrix via `lookAt` and store at {@link outputRef}. */
    | { type: "CALCULATE_3D_VIEW", outputRef: string, up: ValueEntry<vec3>, position: ValueEntry<vec3>, direction: ValueEntry<vec3> }

    /** Multiply a projection and view matrix into a combined view-projection matrix. */
    | { type: "CALCULATE_VIEW_PROJECTION", outputRef: string, projectionRef: string, viewRef: string }

    /** Set the viewport to the given size. */
    | { type: "SET_VIEWPORT", size: ValueEntry<[number, number]>, scale: ValueEntry<number>}

    /** Clear the color and depth buffers of the currently bound framebuffer. */
    | { type: "CLEAR_BUFFER", clearColor: ValueEntry<[number, number, number, number]> }

    /** Download data from WASM into a data resource. */
    | { type: "DOWNLOAD_WASM_DATA", wasmDataRef: string, outputRef: string, fetch: () => unknown }

    /** Upload data from a JS resource into WASM. */
    | { type: "UPLOAD_WASM_DATA", sourceRef: ValueEntry, wasmDataRef: string, upload: (data: unknown) => void }

    /** Execute a WASM operation and propagate dirty flags to outputs. */
    | {
        type: "EXECUTE_WASM",
        wasmInputRefs: string[],
        dataInputRefs: ValueEntry[],
        func: (args: unknown[]) => Record<string, boolean>,
        outputKeyMapping: Record<string, string[]>
    }

    /** Download vertex data from WASM into a vertex buffer. */
    | {
        type: "DOWNLOAD_WASM_VERTEX_DATA",
        wasmDataRef: string,
        outputRef: string,
        fetch: () => VertexDataResult
    }
