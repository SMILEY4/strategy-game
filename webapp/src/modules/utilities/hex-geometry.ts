import {vec2} from "gl-matrix";

/** The square root of 3, the constant that relates axial hex coordinates to world coordinates. */
export const SQRT_3 = Math.sqrt(3);

export interface HexAxialPosition {
    q: number,
    r: number,
}

/**
 * Convert axial hex coordinates (q, r) to world coordinates on the y = 0 ground plane.
 * Pointy-top orientation with unit size. Keep in sync with the GLSL helper in
 * `src/pages/game/renderer/shader/utils/hex-to-world.glsl`.
 */
export function hexToWorld(q: number, r: number): { x: number, z: number } {
    return {
        x: SQRT_3 * q + (SQRT_3 / 2) * r,
        z: (3 / 2) * r,
    };
}

/**
 * Convert world coordinates on the y = 0 ground plane to the nearest axial hex (q, r).
 * Inverse of {@link hexToWorld}, using cube-coordinate rounding to resolve ties.
 */
export function worldToHex(x: number, z: number): HexAxialPosition {
    const rFrac = z / 1.5;
    const qFrac = (x - (SQRT_3 / 2) * rFrac) / SQRT_3;

    const rq = Math.round(qFrac);
    const rr = Math.round(rFrac);
    const rs = Math.round(-qFrac - rFrac);

    const qDiff = Math.abs(rq - qFrac);
    const rDiff = Math.abs(rr - rFrac);
    const sDiff = Math.abs(rs - (-qFrac - rFrac));

    let hexQ = rq;
    let hexR = rr;
    if (qDiff > rDiff && qDiff > sDiff) {
        hexQ = -rr - rs;
    } else if (rDiff > sDiff) {
        hexR = -rq - rs;
    }
    return {q: hexQ, r: hexR};
}

/** Number of floats per vertex in the unit hexagon mesh: 3 position + 2 UV. */
const VERTEX_FLOAT_COUNT = 5;
/** Unit hexagon mesh vertices: 6 triangles × 3 vertices. */
const VERTEX_COUNT = 6 * 3;

/**
 * Build a unit hexagon mesh in the XZ-plane (y = 0) as a fan of 6 triangles.
 * The mesh has radius 1, is pointy-top and matches the `hexToWorld` orientation.
 * Interleaved float32 attributes per vertex: `[x, y, z, u, v]`.
 */
export function createUnitHexagonMesh(): ArrayBuffer {
    const buffer = new ArrayBuffer(VERTEX_COUNT * VERTEX_FLOAT_COUNT * Float32Array.BYTES_PER_ELEMENT);
    const view = new DataView(buffer);
    let viewCounter = 0;

    function pushFloat32(value: number): void {
        view.setFloat32(viewCounter, value, true);
        viewCounter += Float32Array.BYTES_PER_ELEMENT;
    }

    function pushVertex(x: number, z: number, u: number, v: number): void {
        pushFloat32(x);
        pushFloat32(0);
        pushFloat32(z);
        pushFloat32(u);
        pushFloat32(v);
    }

    const center = vec2.fromValues(0, 0);
    const pointerA = vec2.fromValues(0, 1);
    const pointerB = vec2.fromValues(0, 1);
    vec2.rotate(pointerB, pointerB, center, deg2rad(60));

    for (let i = 0; i < 6; i++) {
        // center
        pushVertex(0, 0, 0.5, 0.5);
        // corner a
        pushVertex(pointerA[0], pointerA[1], 0.5 + pointerA[0] * 0.5, 0.5 + pointerA[1] * 0.5);
        // corner b
        pushVertex(pointerB[0], pointerB[1], 0.5 + pointerB[0] * 0.5, 0.5 + pointerB[1] * 0.5);
        // rotate triangle
        vec2.rotate(pointerA, pointerA, center, deg2rad(60));
        vec2.rotate(pointerB, pointerB, center, deg2rad(60));
    }

    return buffer;
}

function deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
}