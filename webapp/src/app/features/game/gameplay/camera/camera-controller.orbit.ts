import type {CameraDatabase} from "@app/features/game/database/camera.database.ts";
import type {TileDatabase} from "@app/features/game/database/tile.database.ts";
import {TileQueries} from "@app/features/game/database/tile.database.ts";
import type {CameraController} from "@app/features/game/gameplay/camera/camera-controller.ts";
import {mat4, vec3, vec4} from "gl-matrix";

const MIN_DIST = 20;
const MAX_DIST = 150;
const PITCH_AT_MIN = 25 * Math.PI / 180;
const PITCH_AT_MAX = 75 * Math.PI / 180;
const MOVE_SPEED = 0.3;
const ZOOM_SPEED = 0.02;
const UP = vec3.fromValues(0, 1, 0);
const SQRT3 = Math.sqrt(3);

interface Dependencies {
    cameraDb: CameraDatabase;
    tileDb: TileDatabase;
}

function screenToWorld(
    x: number, y: number,
    position: vec3, direction: vec3, up: vec3,
    fov: number, aspect: number, near: number, far: number,
    canvasWidth: number, canvasHeight: number,
): vec3 | null {
    const ndcX = (2 * x) / canvasWidth - 1;
    const ndcY = 1 - (2 * y) / canvasHeight;

    const projection = mat4.create();
    mat4.perspective(projection, fov, aspect, near, far);

    const view = mat4.create();
    const target = vec3.add(vec3.create(), position, direction);
    mat4.lookAt(view, position, target, up);

    const vp = mat4.create();
    mat4.multiply(vp, projection, view);

    const flipY = mat4.fromValues(
        1, 0, 0, 0,
        0, -1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    );
    mat4.multiply(vp, flipY, vp);

    const invVp = mat4.create();
    mat4.invert(invVp, vp);

    const nearClip = vec4.fromValues(ndcX, ndcY, -1, 1);
    const farClip = vec4.fromValues(ndcX, ndcY, 1, 1);
    vec4.transformMat4(nearClip, nearClip, invVp);
    vec4.transformMat4(farClip, farClip, invVp);

    vec4.scale(nearClip, nearClip, 1 / nearClip[3]);
    vec4.scale(farClip, farClip, 1 / farClip[3]);

    const rayDir = vec3.fromValues(
        farClip[0] - nearClip[0],
        farClip[1] - nearClip[1],
        farClip[2] - nearClip[2],
    );
    vec3.normalize(rayDir, rayDir);

    if (Math.abs(rayDir[1]) < 0.0001) return null;

    const t = -position[1] / rayDir[1];
    return vec3.fromValues(
        position[0] + t * rayDir[0],
        0,
        position[2] + t * rayDir[2],
    );
}

export const cameraControllerOrbit = ({cameraDb, tileDb}: Dependencies): CameraController => {

    const pivot = vec3.fromValues(0, 0, 0);
    let distance = 40;
    const yaw = 0;

    const pressedKeys = new Set<string>();
    let canvasWidth = 1;
    let canvasHeight = 1;

    const handleKeyDown = (event: KeyboardEvent): void => {
        if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
            event.preventDefault();
        }
        pressedKeys.add(event.key.toLowerCase());
    };

    const handleKeyUp = (event: KeyboardEvent): void => {
        pressedKeys.delete(event.key.toLowerCase());
    };

    const handleBlur = (): void => {
        pressedKeys.clear();
    };

    function computePitch(dist: number): number {
        const t = (dist - MIN_DIST) / (MAX_DIST - MIN_DIST);
        return PITCH_AT_MAX + (PITCH_AT_MIN - PITCH_AT_MAX) * (1 - t);
    }

    function applyCamera(dist: number) {
        const pitch = computePitch(dist);
        const cosPitch = Math.cos(pitch);
        const sinPitch = Math.sin(pitch);

        const position = vec3.fromValues(
            pivot[0] + dist * Math.cos(yaw) * cosPitch,
            pivot[1] + dist * sinPitch,
            pivot[2] + dist * Math.sin(yaw) * cosPitch,
        );

        const direction = vec3.create();
        vec3.sub(direction, pivot, position);
        vec3.normalize(direction, direction);

        cameraDb.update(() => ({
            position: position,
            direction: direction,
            up: UP,
        }));
    }

    return {

        initialize: () => {
            window.addEventListener("keydown", handleKeyDown);
            window.addEventListener("keyup", handleKeyUp);
            window.addEventListener("blur", handleBlur);
            applyCamera(distance);
        },

        dispose: () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", handleBlur);
            pressedKeys.clear();
        },

        update: () => {
            const forward = pressedKeys.has("w") || pressedKeys.has("W");
            const backward = pressedKeys.has("s") || pressedKeys.has("S");
            const left = pressedKeys.has("a") || pressedKeys.has("A");
            const right = pressedKeys.has("d") || pressedKeys.has("D");

            if (forward || backward || left || right) {
                const pitch = computePitch(distance);
                const cosPitch = Math.cos(pitch);

                const fwd = vec3.fromValues(
                    -Math.cos(yaw) * cosPitch,
                    0,
                    -Math.sin(yaw) * cosPitch,
                );
                vec3.normalize(fwd, fwd);

                const rgt = vec3.fromValues(
                    Math.sin(yaw),
                    0,
                    -Math.cos(yaw),
                );

                const speed = distance * MOVE_SPEED / 40;
                const move = vec3.create();
                if (forward) vec3.add(move, move, fwd);
                if (backward) vec3.sub(move, move, fwd);
                if (right) vec3.sub(move, move, rgt);
                if (left) vec3.add(move, move, rgt);

                if (vec3.length(move) > 0) {
                    vec3.scale(move, move, speed);
                    vec3.add(pivot, pivot, move);
                }
            }

            applyCamera(distance);
        },

        onMouseMove: (mx: number, my: number, x: number, y: number, buttons: number) => {
            if ((buttons & 1) !== 1) return;

            const cam = cameraDb.get();
            const prevWorld = screenToWorld(
                x - mx, y - my,
                cam.position, cam.direction, cam.up,
                cam.fov, cam.aspect, cam.near, cam.far,
                canvasWidth, canvasHeight,
            );
            const currWorld = screenToWorld(
                x, y,
                cam.position, cam.direction, cam.up,
                cam.fov, cam.aspect, cam.near, cam.far,
                canvasWidth, canvasHeight,
            );

            if (!prevWorld || !currWorld) return;

            const delta = vec3.create();
            vec3.sub(delta, prevWorld, currWorld);
            vec3.add(pivot, pivot, delta);
        },

        onCanvasClick: (x: number, y: number) => {
            const cam = cameraDb.get();
            const world = screenToWorld(
                x, y,
                cam.position, cam.direction, cam.up,
                cam.fov, cam.aspect, cam.near, cam.far,
                canvasWidth, canvasHeight,
            );
            if (!world) return;

            const rFrac = world[2] / 1.5;
            const qFrac = (world[0] - SQRT3 / 2 * rFrac) / SQRT3;

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

            const tile = tileDb.querySingle(TileQueries.BY_POSITION, {q: hexQ, r: hexR});
            if (tile) {
                console.log(`Clicked tile q=${hexQ} r=${hexR} id=${tile.id}`);
            } else {
                console.log(`Clicked empty hex q=${hexQ} r=${hexR}`);
            }
        },

        onScroll: (delta: number, x: number, y: number) => {
            const cam = cameraDb.get();
            const preZoomWorld = screenToWorld(
                x, y,
                cam.position, cam.direction, cam.up,
                cam.fov, cam.aspect, cam.near, cam.far,
                canvasWidth, canvasHeight,
            );

            distance = Math.max(MIN_DIST, Math.min(MAX_DIST, distance - delta * ZOOM_SPEED));

            applyCamera(distance);

            if (!preZoomWorld) return;

            const newCam = cameraDb.get();
            const postZoomWorld = screenToWorld(
                x, y,
                newCam.position, newCam.direction, newCam.up,
                newCam.fov, newCam.aspect, newCam.near, newCam.far,
                canvasWidth, canvasHeight,
            );

            if (!postZoomWorld) return;

            const adjust = vec3.create();
            vec3.sub(adjust, preZoomWorld, postZoomWorld);
            vec3.add(pivot, pivot, adjust);

            applyCamera(distance);
        },

        onResize: (width: number, height: number) => {
            canvasWidth = width;
            canvasHeight = height;
            cameraDb.update(() => ({
                aspect: width / height,
            }));
        },
    };
};
