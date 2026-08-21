import {mat4, vec3, vec4} from "gl-matrix";

/** The subset of the camera state needed for screen-to-world unprojection. */
export interface CameraState {
    position: vec3;
    direction: vec3;
    up: vec3;
    fov: number;
    aspect: number;
    near: number;
    far: number;
}

/**
 * Unproject a screen position (in canvas pixels, y-axis pointing down) to the intersection of
 * the view ray with the y = 0 ground plane. Returns null when the ray is (nearly) parallel to
 * the ground plane.
 */
export function screenToGroundPoint(
    x: number,
    y: number,
    camera: CameraState,
    canvasWidth: number,
    canvasHeight: number,
): vec3 | null {
    const ndcX = (2 * x) / canvasWidth - 1;
    const ndcY = (2 * y) / canvasHeight - 1;

    const projection = mat4.create();
    mat4.perspective(projection, camera.fov, camera.aspect, camera.near, camera.far);

    const view = mat4.create();
    const target = vec3.add(vec3.create(), camera.position, camera.direction);
    mat4.lookAt(view, camera.position, target, camera.up);

    const viewProjection = mat4.create();
    mat4.multiply(viewProjection, projection, view);

    const inverseViewProjection = mat4.create();
    mat4.invert(inverseViewProjection, viewProjection);

    const nearClip = vec4.fromValues(ndcX, ndcY, -1, 1);
    const farClip = vec4.fromValues(ndcX, ndcY, 1, 1);
    vec4.transformMat4(nearClip, nearClip, inverseViewProjection);
    vec4.transformMat4(farClip, farClip, inverseViewProjection);

    vec4.scale(nearClip, nearClip, 1 / nearClip[3]);
    vec4.scale(farClip, farClip, 1 / farClip[3]);

    const rayDirection = vec3.fromValues(
        farClip[0] - nearClip[0],
        farClip[1] - nearClip[1],
        farClip[2] - nearClip[2],
    );
    vec3.normalize(rayDirection, rayDirection);

    if (Math.abs(rayDirection[1]) < 0.0001) {
        return null;
    }

    const t = -camera.position[1] / rayDirection[1];
    return vec3.fromValues(
        camera.position[0] + t * rayDirection[0],
        0,
        camera.position[2] + t * rayDirection[2],
    );
}