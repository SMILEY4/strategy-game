/** Special resource key storing the canvas dimensions at runtime. */
export const KEY_CANVAS_SIZE = "rg-internal:canvas-size";

/** Suffix for camera projection sub-resource. */
export const SUB_PROJECTION = "proj";
/** Suffix for camera view sub-resource. */
export const SUB_VIEW = "view";
/** Suffix for combined view-projection sub-resource. */
export const SUB_VIEW_PROJECTION = "viewproj";
/** Suffix for WASM vertex data sub-resource. */
export const SUB_VERTEX_DATA = "vertexdata";

/** Build a sub-resource key from a base key and sub-key name. */
export function subKey(base: string, key: string): string {
    return `${base}#${key}`;
}
