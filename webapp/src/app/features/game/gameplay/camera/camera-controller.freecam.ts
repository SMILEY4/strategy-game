import type {CameraDatabase} from "@app/features/game/database/camera.database.ts";
import type {CameraController} from "@app/features/game/gameplay/camera/camera-controller.ts";
import {quat, vec3} from "gl-matrix";

interface Dependencies {
    cameraDb: CameraDatabase;
}

const MOVE_SPEED = 0.5;
const MOUSE_SENSITIVITY = 0.002;
const UP = vec3.fromValues(0, 1, 0);

export const cameraControllerFreecam = ({cameraDb}: Dependencies): CameraController => {

    const pressedKeys = new Set<string>();

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


    return {

        initialize: () => {
            window.addEventListener("keydown", handleKeyDown);
            window.addEventListener("keyup", handleKeyUp);
            window.addEventListener("blur", handleBlur);
        },

        dispose: () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", handleBlur);
            pressedKeys.clear();
        },

        update: () => {
            const forwardPressed = pressedKeys.has("w") || pressedKeys.has("W");
            const backwardPressed = pressedKeys.has("s") || pressedKeys.has("S");
            const leftPressed = pressedKeys.has("a") || pressedKeys.has("A");
            const rightPressed = pressedKeys.has("d") || pressedKeys.has("D");

            if (!forwardPressed && !backwardPressed && !leftPressed && !rightPressed) {
                return;
            }

            cameraDb.update(camera => {
                const forward = vec3.clone(camera.direction);

                const right = vec3.create();
                vec3.cross(right, forward, UP);
                vec3.normalize(right, right);

                const moveDirection = vec3.create();
                if (forwardPressed) vec3.add(moveDirection, moveDirection, forward);
                if (backwardPressed) vec3.sub(moveDirection, moveDirection, forward);
                if (rightPressed) vec3.sub(moveDirection, moveDirection, right);
                if (leftPressed) vec3.add(moveDirection, moveDirection, right);

                if (vec3.length(moveDirection) > 0) {
                    vec3.scale(moveDirection, moveDirection, MOVE_SPEED);
                    vec3.normalize(moveDirection, moveDirection);
                    const position = vec3.add(vec3.create(), camera.position, moveDirection);
                    return {
                        position: position
                    };
                }

                return {};
            });
        },

        onMouseMove: (mx: number, my: number, buttons: number) => {
            if ((buttons & 1) !== 1) {
                return;
            }

            cameraDb.update(camera => {
                const localRight = vec3.create();
                vec3.cross(localRight, camera.direction, UP);
                vec3.normalize(localRight, localRight);

                let pitchAngle = -my * MOUSE_SENSITIVITY;
                const currentDot = vec3.dot(camera.direction, UP);

                if ((currentDot > 0.98 && pitchAngle > 0) || (currentDot < -0.98 && pitchAngle < 0)) {
                    pitchAngle = 0;
                }

                const yawRotation = quat.create();
                quat.setAxisAngle(yawRotation, UP, mx * MOUSE_SENSITIVITY);

                const pitchRotation = quat.create();
                quat.setAxisAngle(pitchRotation, localRight, pitchAngle);

                const combinedRotation = quat.create();
                quat.multiply(combinedRotation, yawRotation, pitchRotation);

                const direction = vec3.create();
                vec3.transformQuat(direction, camera.direction, combinedRotation);
                vec3.normalize(direction, direction);

                return {
                    direction: direction
                };
            });
        },


        onResize: (width: number, height: number) => {
            cameraDb.update(() => {
                return {
                    aspect: width / height,
                }
            })
        },
    };
};
