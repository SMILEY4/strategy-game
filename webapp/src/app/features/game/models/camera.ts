import type {vec3} from "gl-matrix";

export interface Camera {
    position: vec3;
    direction: vec3;
}