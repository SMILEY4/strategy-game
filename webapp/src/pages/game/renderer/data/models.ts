import type {vec3} from "gl-matrix";
import type {Tile} from "@app/features/game/models/tile.ts";


export interface TileCollection {
    tiles: Tile[],
    revId: string
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