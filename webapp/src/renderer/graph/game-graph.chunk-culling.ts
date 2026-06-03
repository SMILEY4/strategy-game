import type {RenderGraphBuilder} from "@rendergraph/render-graph-builder.ts";
import type {RenderCameraData, RenderChunk, RenderTile} from "@/renderer/data/models.ts";
import type {DataRenderGraphNode} from "@rendergraph/nodes/rg-node.data.ts";
import {HexUtils} from "@/common/hexUtils.ts";
import {vec3} from "gl-matrix";


export function gameGraphChunkCulling(
    g: RenderGraphBuilder,
    nodes: {
        dataTilemap: DataRenderGraphNode<RenderTile[]>,
        dataCamera: DataRenderGraphNode<RenderCameraData>,
        dataMapRadius: DataRenderGraphNode<number>,
        dataChunkRadius: DataRenderGraphNode<number>,
        dataTileRadius: DataRenderGraphNode<number>,
    },
) {

    /**
     * Generate a list of all chunks (and their tiles)
     */
    const dataAllChunks = g.dataTransformer<RenderChunk[]>(
        g.transform<[number, number, number, RenderTile[]], RenderChunk[]>({
            inputs: [nodes.dataMapRadius, nodes.dataChunkRadius, nodes.dataTileRadius, nodes.dataTilemap],
            func: (mapRadius: number, chunkRadius: number, tileRadius: number, tiles: RenderTile[]) => calculateChunks(tiles, mapRadius, chunkRadius, tileRadius),
        }),
    );

    /**
     * Take the list of all chunks and return only the visible chunks
     */
    const dataVisibleChunks = g.dataTransformer<RenderChunk[]>(
        g.transform<[RenderChunk[], RenderCameraData, number], RenderChunk[]>({
            inputs: [dataAllChunks, nodes.dataCamera, nodes.dataTileRadius],
            func: (allChunks, camera, tileRadius) => calculateVisibleChunks(allChunks, camera, tileRadius),
        }),
    );


    return {
        dataAllChunks,
        dataVisibleChunks,
    };
}


function calculateChunks(tiles: RenderTile[], mapRadius: number, chunkRadius: number, tileWorldRadius: number): RenderChunk[] {
    const chunks: RenderChunk[] = [];

    console.log("map radius", mapRadius, chunkRadius, tileWorldRadius);

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
                centerWorldPos: hexToWorld(centerQ, centerR, tileWorldRadius),
                minY: -tileWorldRadius,
                maxY: +tileWorldRadius * 2,
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

    console.log("totalChunks", chunks.length)

    return Array.from(chunks.values());
}


function hexToWorld(q: number, r: number, radius: number): vec3 {
    const x = radius * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const z = radius * (1.5 * r);
    return vec3.fromValues(x, 0, z);
}

function calculateVisibleChunks(
    chunks: RenderChunk[],
    camera: RenderCameraData,
    tileWorldRadius: number,
): RenderChunk[] {
    const right = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), camera.direction, camera.up));
    const up = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), right, camera.direction));

    const halfVFov = camera.fov / 2;
    const halfHFov = Math.atan(Math.tan(halfVFov) * camera.aspect);

    const planes = buildFrustumPlanes(camera, right, up, halfVFov, halfHFov);

    const visibleChunks: RenderChunk[] = [];

    for (const chunk of chunks) {
        if (isCylinderInFrustum(chunk, tileWorldRadius, planes)) {
            visibleChunks.push(chunk);
        }
        visibleChunks.push(chunk);
    }

    console.log("visibleChunks", visibleChunks.length);

    return visibleChunks;
}

interface FrustumPlane {
    normal: vec3;
    d: number;
}

function buildFrustumPlanes(
    camera: RenderCameraData,
    right: vec3,
    up: vec3,
    halfVFov: number,
    halfHFov: number,
): FrustumPlane[] {
    const planes: FrustumPlane[] = [];

    planes.push(makePlane(camera.direction, camera.position, camera.near));
    planes.push(makePlane(vec3.negate(vec3.create(), camera.direction), camera.position, -camera.far));

    const leftNormal = rotateVec(camera.direction, up, halfHFov);
    const rightNormal = rotateVec(camera.direction, up, -halfHFov);
    planes.push(makePlaneFromNormal(leftNormal, camera.position));
    planes.push(makePlaneFromNormal(rightNormal, camera.position));

    const topNormal = rotateVec(camera.direction, right, -halfVFov);
    const bottomNormal = rotateVec(camera.direction, right, halfVFov);
    planes.push(makePlaneFromNormal(topNormal, camera.position));
    planes.push(makePlaneFromNormal(bottomNormal, camera.position));

    return planes;
}

function makePlane(normal: vec3, origin: vec3, offset: number): FrustumPlane {
    const pointOnPlane = vec3.scaleAndAdd(vec3.create(), origin, normal, offset);
    return makePlaneFromNormal(normal, pointOnPlane);
}

function makePlaneFromNormal(normal: vec3, point: vec3): FrustumPlane {
    return {
        normal: normal,
        d: -vec3.dot(normal, point),
    };
}

function isCylinderInFrustum(chunk: RenderChunk, tileWorldRadius: number, planes: FrustumPlane[]): boolean {
    const chunkRadius = chunk.radius * tileWorldRadius;

    for (const plane of planes) {
        const nx = plane.normal[0];
        const nz = plane.normal[2];
        const horizontalNormalLength = Math.sqrt(nx * nx + nz * nz);

        let furthestX = chunk.centerWorldPos[0];
        let furthestZ = chunk.centerWorldPos[2];

        if (horizontalNormalLength > 0.000001) {
            furthestX += (nx / horizontalNormalLength) * chunkRadius;
            furthestZ += (nz / horizontalNormalLength) * chunkRadius;
        }

        const furthestY = plane.normal[1] >= 0 ? chunk.maxY : chunk.minY;

        const dotProduct = (plane.normal[0] * furthestX) +
            (plane.normal[1] * furthestY) +
            (plane.normal[2] * furthestZ);

        if (dotProduct + plane.d < 0) {
            return false;
        }
    }

    return true;
}

function rotateVec(v: vec3, axis: vec3, angle: number): vec3 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dot = vec3.dot(axis, v);
    const cross = vec3.cross(vec3.create(), axis, v);
    const result = vec3.create();
    vec3.scale(result, v, cos);
    vec3.scaleAndAdd(result, result, cross, sin);
    vec3.scaleAndAdd(result, result, axis, dot * (1 - cos));
    return vec3.normalize(result, result);
}
