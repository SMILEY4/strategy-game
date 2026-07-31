import type {vec3} from "gl-matrix";

export interface Camera {
    up: vec3;
    position: vec3;
    direction: vec3;
    fov: number,
    near: number,
    far: number,
    aspect: number,
}