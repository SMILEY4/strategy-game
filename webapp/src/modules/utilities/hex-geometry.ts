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

/** Unit hexagon mesh vertices: 6 triangles × 3 vertices. */
const VERTEX_COUNT = 6 * 3;

/**
 * Build a unit hexagon mesh in the XZ-plane (y = 0) as a fan of 6 triangles.
 * The mesh has radius 1, is pointy-top and matches the `hexToWorld` orientation.
 * Interleaved float32 attributes per vertex: `[x, y, z, u, v]`.
 */
export function createUnitHexagonMesh(withUv: boolean, withCenter: boolean): ArrayBuffer {

    let floatCount = 3;
    if(withUv) floatCount += 2
    if(withCenter) floatCount += 1

    const buffer = new ArrayBuffer(VERTEX_COUNT * floatCount * Float32Array.BYTES_PER_ELEMENT);
    const view = new DataView(buffer);
    let viewCounter = 0;

    function pushFloat32(value: number): void {
        view.setFloat32(viewCounter, value, true);
        viewCounter += Float32Array.BYTES_PER_ELEMENT;
    }

    function pushPosition(x: number, z: number): void {
        pushFloat32(x);
        pushFloat32(0);
        pushFloat32(z);
    }

    function pushUV(u: number, v: number): void {
        if(withUv) {
            pushFloat32(u);
            pushFloat32(v);
        }
    }

    function pushCenter(center: number): void {
        if(withCenter) {
            pushFloat32(center);
        }
    }


    const center = vec2.fromValues(0, 0);
    const pointerA = vec2.fromValues(0, 1);
    const pointerB = vec2.fromValues(0, 1);
    vec2.rotate(pointerB, pointerB, center, deg2rad(60));

    for (let i = 0; i < 6; i++) {

        // center
        pushPosition(0,0)
        pushUV(0.5, 0.5)
        pushCenter(1)

        // corner a
        pushPosition(pointerA[0], pointerA[1])
        pushUV(0.5 + pointerA[0] * 0.5, 0.5 + pointerA[1] * 0.5)
        pushCenter(0)

        // corner b
        pushPosition(pointerB[0], pointerB[1])
        pushUV(0.5 + pointerB[0] * 0.5, 0.5 + pointerB[1] * 0.5)
        pushCenter(0)

        // rotate triangle
        vec2.rotate(pointerA, pointerA, center, deg2rad(60));
        vec2.rotate(pointerB, pointerB, center, deg2rad(60));
    }

    return buffer;
}

function deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
}