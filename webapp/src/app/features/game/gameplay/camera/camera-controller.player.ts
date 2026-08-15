import type {CameraDatabase} from "@app/features/game/database/camera.database.ts";
import type {CameraController} from "@app/features/game/gameplay/camera/camera-controller.ts";
import {screenToGroundPoint} from "@modules/utilities/camera-utils.ts";
import {worldToHex} from "@modules/utilities/hex-geometry.ts";
import {vec3} from "gl-matrix";

const MIN_DIST = 20;
const MAX_DIST = 300;
const PITCH_AT_MIN = 25 * Math.PI / 180;
const PITCH_AT_MAX = 75 * Math.PI / 180;
const MOVE_SPEED = 0.3;
const ZOOM_SPEED = 0.03;
const UP = vec3.fromValues(0, 1, 0);

interface Dependencies {
    cameraDb: CameraDatabase;
}

export const cameraControllerPlayer = ({cameraDb}: Dependencies): CameraController => {

    const pivot = vec3.fromValues(0, 0, 0);
    let distance = 40;
    const yaw = 0;
    let dirty = true;

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

            if (forward || backward || left || right || dirty) {
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

                applyCamera(distance);
                dirty = false;

            }
        },

        onMouseMove: (mx: number, my: number, x: number, y: number, buttons: number) => {
            if ((buttons & 1) !== 1) return;

            const cam = cameraDb.get();
            const prevWorld = screenToGroundPoint(
                x - mx, y - my,
                cam,
                canvasWidth, canvasHeight,
            );
            const currWorld = screenToGroundPoint(
                x, y,
                cam,
                canvasWidth, canvasHeight,
            );

            if (!prevWorld || !currWorld) return;

            const delta = vec3.create();
            vec3.sub(delta, prevWorld, currWorld);
            vec3.add(pivot, pivot, delta);
            dirty = true;
        },

        transformScreenToHex: (x: number, y: number) => {
            const cam = cameraDb.get();
            const world = screenToGroundPoint(
                x, y,
                cam,
                canvasWidth, canvasHeight,
            );
            if (!world) {
                throw new Error("Could not transform to world coordinates");
            }

            return worldToHex(world[0], world[2]);
        },

        onScroll: (delta: number, x: number, y: number) => {
            const cam = cameraDb.get();
            const preZoomWorld = screenToGroundPoint(
                x, y,
                cam,
                canvasWidth, canvasHeight,
            );

            distance = Math.max(MIN_DIST, Math.min(MAX_DIST, distance - delta * ZOOM_SPEED));

            applyCamera(distance);

            if (!preZoomWorld) return;

            const newCam = cameraDb.get();
            const postZoomWorld = screenToGroundPoint(
                x, y,
                newCam,
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