/** Special resource key storing the canvas dimensions at runtime. */
export const KEY_CANVAS_SIZE = "rg-internal:canvas-size";

/** Build the resource key for a camera's projection matrix. */
export function cameraProjectionKey(cameraId: string): string { return `${cameraId}#proj`; }

/** Build the resource key for a camera's view matrix. */
export function cameraViewKey(cameraId: string): string { return `${cameraId}#view`; }

/** Build the resource key for a camera's combined view-projection matrix. */
export function cameraViewProjectionKey(cameraId: string): string { return `${cameraId}#viewproj`; }

/** Build the resource key for WASM vertex data buffer. */
export function wasmVertexDataKey(wasmNodeId: string): string { return `${wasmNodeId}#vertexdata`; }

/** Build a sub-resource key by appending a sub-name to a base key with the `#` separator. */
export function subResourceKey(baseId: string, subName: string): string { return `${baseId}#${subName}`; }
