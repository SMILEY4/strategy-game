import type {RenderGraphBuilder} from "@/modules/rendergraph/render-graph-builder.ts";
import type {RenderCameraData, RenderChunk, RenderTile} from "@/renderer/data/models.ts";
import type {DataRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.data.ts";
import {HexUtils} from "@/modules/utilities/hexUtils.ts";
import {mat4, vec3, vec4} from "gl-matrix";
// import SHADER_CHUNK_BOUNDS_VERT from "./../shader/chunkBounds.vsh?raw";
// import SHADER_CHUNK_BOUNDS_FRAG from "./../shader/chunkBounds.fsh?raw";
import type {CameraRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.camera.ts";

export function gameGraphChunkCulling(
    g: RenderGraphBuilder,
    nodes: {
        dataTilemap: DataRenderGraphNode<RenderTile[]>,
        dataCamera: DataRenderGraphNode<RenderCameraData>,
        dataMapRadius: DataRenderGraphNode<number>,
        dataChunkRadius: DataRenderGraphNode<number>,
        camera: CameraRenderGraphNode,
    },
) {

    /**
     * Generate a list of all chunks (and their tiles)
     */
    const dataAllChunks = g.dataTransformer<RenderChunk[]>(
        g.transform<[number, number, RenderTile[]], RenderChunk[]>({
            inputs: [nodes.dataMapRadius, nodes.dataChunkRadius, nodes.dataTilemap],
            func: (mapRadius: number, chunkRadius: number, tiles: RenderTile[]) => calculateChunks(tiles, mapRadius, chunkRadius),
        }),
    );

    /**
     * Take the list of all chunks and return only the visible chunks
     */
    const dataVisibleChunks = g.dataTransformer<RenderChunk[]>(
        g.transform<[RenderChunk[], RenderCameraData], RenderChunk[]>({
            inputs: [dataAllChunks, nodes.dataCamera],
            func: (allChunks, camera) => calculateVisibleChunks(allChunks, camera),
            checkChanged: (prev: RenderChunk[], next: RenderChunk[]) => checkChanges(prev, next)
        }),
    );

    // const chunkCylinderMeshTransformer = g.transformVertexOut({
    //     inputs: [],
    //     outputs: {
    //         mesh: {
    //             content: "vertices",
    //             layout: [
    //                 {
    //                     name: "vertexPosition",
    //                     type: GlAttributeType.FLOAT,
    //                     amountComponents: 3
    //                 }
    //             ]
    //         }
    //     },
    //     func: () => {
    //
    //         const nPoints = 50;
    //         const minY = -0.5;
    //         const maxY = 0.5
    //
    //         const buffer = new ArrayBuffer(nPoints * 6 * 3 * GlAttributeType.FLOAT.bytes);
    //         const view = new DataView(buffer);
    //         let viewCounter = 0;
    //
    //         function pushFloat32(value: number) {
    //             view.setFloat32(viewCounter, value, true);
    //             viewCounter += GlAttributeType.FLOAT.bytes;
    //         }
    //
    //         function pushFloat32Vec3(x: number, y: number, z: number) {
    //             pushFloat32(x);
    //             pushFloat32(y);
    //             pushFloat32(z);
    //         }
    //
    //         const center = vec2.fromValues(0, 0);
    //         const pointer = vec2.fromValues(0, 1);
    //
    //         const pointsCircle: vec2[] = [];
    //         for(let i=0; i<nPoints; i++) {
    //             pointsCircle.push(vec2.fromValues(pointer[0], pointer[1]))
    //             vec2.rotate(pointer, pointer, center, deg2rad(360/nPoints))
    //         }
    //
    //         for (let i = 1; i < pointsCircle.length+1; i++) {
    //             const a = pointsCircle[i-1]
    //             const b = pointsCircle[i%pointsCircle.length]
    //             pushFloat32Vec3(a[0], minY, a[1])
    //             pushFloat32Vec3(b[0], minY, b[1])
    //         }
    //
    //         for (let i = 1; i < pointsCircle.length+1; i++) {
    //             const a = pointsCircle[i-1]
    //             const b = pointsCircle[i%pointsCircle.length]
    //             pushFloat32Vec3(a[0], maxY, a[1])
    //             pushFloat32Vec3(b[0], maxY, b[1])
    //         }
    //
    //         for (let i = 0; i < pointsCircle.length; i++) {
    //             const p = pointsCircle[i]
    //             pushFloat32Vec3(p[0], minY, p[1])
    //             pushFloat32Vec3(p[0], maxY, p[1])
    //         }
    //
    //         return {
    //             "mesh": {
    //                 data: buffer,
    //                 count: nPoints * 6,
    //             },
    //         };
    //     }
    // })
    //
    // const chunkCylinderInstancesTransformer = g.transformVertexOut({
    //     inputs: [dataAllChunks],
    //     outputs: {
    //         instances: {
    //             content: "instances",
    //             layout: [
    //                 {
    //                     name: "worldPosition",
    //                     type: GlAttributeType.FLOAT,
    //                     amountComponents: 3
    //                 },
    //                 {
    //                     name: "radius",
    //                     type: GlAttributeType.FLOAT,
    //                     amountComponents: 1
    //                 }
    //             ]
    //         }
    //     },
    //     func: (chunks: RenderChunk[]) => {
    //
    //         const buffer = new ArrayBuffer(chunks.length * 4 * GlAttributeType.FLOAT.bytes);
    //         const view = new DataView(buffer);
    //         let viewCounter = 0;
    //
    //         function pushFloat32(value: number) {
    //             view.setFloat32(viewCounter, value, true);
    //             viewCounter += GlAttributeType.FLOAT.bytes;
    //         }
    //
    //         for (const chunk of chunks) {
    //             pushFloat32(chunk.centerWorldPos[0])
    //             pushFloat32(chunk.centerWorldPos[1])
    //             pushFloat32(chunk.centerWorldPos[2])
    //             pushFloat32(chunk.radius)
    //         }
    //
    //         return {
    //             "instances": {
    //                 data: buffer,
    //                 count: chunks.length,
    //             },
    //         };
    //     }
    // })
    //
    // const geometryChunkDebug = g.geometry({
    //     primitives: "lines",
    //     sources: [
    //         g.geometrySource({
    //             source: chunkCylinderMeshTransformer,
    //             output: "mesh",
    //         }),
    //         g.geometrySource({
    //             source: chunkCylinderInstancesTransformer,
    //             output: "instances",
    //         }),
    //     ],
    // });
    //
    // const shader = g.shader({
    //     srcVertex: SHADER_CHUNK_BOUNDS_VERT,
    //     srcFragment: SHADER_CHUNK_BOUNDS_FRAG,
    //     prefixUniforms: "u_",
    //     prefixVertexAttributes: "in_",
    // });

    // const drawChunkBounds = g.draw({
    //     shader: shader,
    //     geometry: geometryChunkDebug,
    //     inputs: {
    //         "camera": nodes.camera,
    //     },
    // });


    return {
        dataAllChunks,
        dataVisibleChunks,
        // drawChunkBounds,
    };
}


function calculateChunks(tiles: RenderTile[], mapRadius: number, chunkRadius: number): RenderChunk[] {
    const chunks: RenderChunk[] = [];

    const chunkGridRadius = Math.ceil(mapRadius / chunkRadius);

    for (let q = -chunkGridRadius; q <= chunkGridRadius; q++) {
        for (let r = -chunkGridRadius; r <= chunkGridRadius; r++) {
            const s = HexUtils.sCoordinate(q, r);
            if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) > chunkGridRadius) {
                continue;
            }
            const centerQ = q * chunkRadius;
            const centerR = r * chunkRadius;
            chunks.push({
                centerQ: centerQ,
                centerR: centerR,
                radius: chunkRadius,
                centerWorldPos: hexToWorld(centerQ, centerR),
                minY: -0.1,
                maxY: +0.1,
                tileIndices: [],
            });
        }
    }

    for (let i = 0, n = tiles.length; i < n; i++) {
        const tile = tiles[i];
        let nearestChunk: RenderChunk | null = null;
        let minDistance = Infinity;

        for (const c of chunks) {
            const dist = HexUtils.distance(tile.q, tile.r, c.centerQ, c.centerR);
            if (dist < minDistance) {
                minDistance = dist;
                nearestChunk = c;
            }
        }

        if (nearestChunk) {
            nearestChunk.tileIndices.push(i);
        }
    }

    return Array.from(chunks.values());
}


function hexToWorld(q: number, r: number): vec3 {
    return vec3.fromValues(
        Math.sqrt(3) * q + Math.sqrt(3) / 2 * r,
        0,
        3 / 2 * r,
    );

}

function calculateVisibleChunks(
    chunks: RenderChunk[],
    camera: RenderCameraData,
): RenderChunk[] {

    const planes = calculateFrustrumPlanes(camera)

    const visibleChunks: RenderChunk[] = [];

    for (const chunk of chunks) {
        if (isDiskVisible(chunk.centerWorldPos, chunk.radius, 1, planes)) {
            visibleChunks.push(chunk);
        }
    }

    return visibleChunks;
}


function calculateFrustrumPlanes(cam: RenderCameraData): vec4[] {

    const planes: vec4[] = Array.from({length: 6}, () => vec4.create());
    const viewMatrix = mat4.create();
    const projMatrix = mat4.create();
    const vpMatrix = mat4.create();
    const target = vec3.create();

    // 1. Calculate Target Point for View Matrix
    vec3.add(target, cam.position, cam.direction);
    mat4.lookAt(viewMatrix, cam.position, target, cam.up);

    // 2. Calculate Projection Matrix
    mat4.perspective(projMatrix, cam.fov, cam.aspect, cam.near, cam.far);

    // 3. Combine into View-Projection Matrix
    mat4.multiply(vpMatrix, projMatrix, viewMatrix);

    const m = vpMatrix;

    // 4. Extract the 6 planes from the VP matrix (Gribb-Hartmann method)
    // Left Plane
    vec4.set(planes[0], m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]);
    // Right Plane
    vec4.set(planes[1], m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]);
    // Bottom Plane
    vec4.set(planes[2], m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]);
    // Top Plane
    vec4.set(planes[3], m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]);
    // Near Plane
    vec4.set(planes[4], m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]);
    // Far Plane
    vec4.set(planes[5], m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]);

    // Normalize the planes so that distance calculations are accurate
    for (let i = 0; i < 6; i++) {
        const p = planes[i];
        const length = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
        if (length > 0) {
            p[0] /= length;
            p[1] /= length;
            p[2] /= length;
            p[3] /= length;
        }
    }

    return planes
}


function isDiskVisible(center: vec3, radius: number, height: number, planes: vec4[]): boolean {
    // Set the true center of the cylinder volume
    const diskCenter: vec3 = vec3.create();
    vec3.set(diskCenter, center[0], center[1] + height / 2, center[2]);

    for (let i = 0; i < 6; i++) {
        const plane = planes[i];
        const nx = plane[0];
        const ny = plane[1];
        const nz = plane[2];
        const d = plane[3];

        // 1. Projected horizontal disk radius along the plane normal XZ
        const normalXZLen = Math.sqrt(nx * nx + nz * nz);
        const projectedRadius = normalXZLen > 0 ? radius * normalXZLen : 0;

        // 2. Projected vertical half-height along the plane normal Y
        const projectedHeight = (height / 2) * Math.abs(ny);

        // Total maximum extension of the disk toward the plane
        const effectiveRadius = projectedRadius + projectedHeight;

        // 3. Dot product (distance to plane)
        // Ax + By + Cz + D
        const distance = nx * diskCenter[0] + ny * diskCenter[1] + nz * diskCenter[2] + d;

        // If the center is further behind the plane than its footprint radius, it's outside
        if (distance < -effectiveRadius) {
            return false;
        }
    }

    return true;
}

function checkChanges(prev: RenderChunk[], next: RenderChunk[]): boolean {

    if(prev === next) {
        return false
    }

    if(prev === null || next === null) {
        return true;
    }
    if(prev === undefined || next === undefined) {
        return true;
    }

    if(prev.length !== next.length) {
        return true;
    }

    const seenItems = new Set<string>();
    for (const chunk of prev) {
        seenItems.add(`${chunk.centerQ},${chunk.centerR}`)
    }

    for (const chunk of next) {
        if(!seenItems.has(`${chunk.centerQ},${chunk.centerR}`)) {
            return true
        }
    }

    return false
}