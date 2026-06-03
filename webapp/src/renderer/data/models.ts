import type {vec3} from "gl-matrix";

export interface RenderChunk {
    centerQ: number,
    centerR: number,
    radius: number,
    centerWorldPos: vec3,
    minY: number,
    maxY: number,
    tileIndices: number[],
}

export interface RenderTile {
    q: number;
    r: number;
}

export interface RenderCameraData {
    revId: number,
    up: vec3,
    position: vec3,
    direction: vec3,
    fov: number,
    near: number,
    far: number,
    aspect: number,
}