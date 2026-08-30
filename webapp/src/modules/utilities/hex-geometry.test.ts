import {describe, expect, test} from "vitest";
import {createUnitHexagonMesh, hexToWorld, worldToHex} from "@modules/utilities/hex-geometry.ts";

describe("hex-geometry", () => {

    describe("hexToWorld", () => {

        test("origin is at world origin", () => {
            expect(hexToWorld(0, 0)).toEqual({x: 0, z: 0});
        });

        test("pointy-top unit hex neighbors are sqrt(3) apart", () => {
            const origin = hexToWorld(0, 0);
            const neighborQ = hexToWorld(1, 0);
            const neighborR = hexToWorld(0, 1);
            expect(Math.hypot(neighborQ.x - origin.x, neighborQ.z - origin.z)).toBeCloseTo(Math.sqrt(3));
            expect(Math.hypot(neighborR.x - origin.x, neighborR.z - origin.z)).toBeCloseTo(Math.sqrt(3));
        });

    });

    describe("worldToHex", () => {

        test("inverse of hexToWorld for tile centers", () => {
            for (const [q, r] of [[0, 0], [1, 0], [0, 1], [3, -2], [-4, 5], [7, 7]]) {
                const world = hexToWorld(q, r);
                expect(worldToHex(world.x, world.z)).toEqual({q: q, r: r});
            }
        });

        test("world positions inside a tile round to that tile", () => {
            const center = hexToWorld(0, 0);
            expect(worldToHex(center.x + 0.2, center.z - 0.1)).toEqual({q: 0, r: 0});
            expect(worldToHex(center.x + 0.9, center.z)).toEqual({q: 1, r: 0});
            expect(worldToHex(center.x, center.z + 1.2)).toEqual({q: 0, r: 1});
        });

    });

    describe("createUnitHexagonMesh", () => {

        test("produces 18 vertices with 5 interleaved floats each", () => {
            const buffer = createUnitHexagonMesh(true, false);
            expect(buffer.byteLength).toBe(18 * 5 * Float32Array.BYTES_PER_ELEMENT);
        });

        test("starts at origin and stays in the XZ-plane", () => {
            const floats = new Float32Array(createUnitHexagonMesh(true, false));
            const vertexCount = 18;
            for (let i = 0; i < vertexCount; i++) {
                const y = floats[i * 5 + 1];
                expect(y).toBe(0);
            }
            const first = floats.subarray(0, 3);
            expect(Array.from(first)).toEqual([0, 0, 0]);
        });

    });

});