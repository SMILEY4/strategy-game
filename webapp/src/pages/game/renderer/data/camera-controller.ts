import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import {quat, vec3} from "gl-matrix";
import type {RenderCameraData} from "@pages/game/renderer/data/models.ts";

export class CameraController {

    private readonly dataProvider: GameRendererDataProvider;

    private readonly  moveSpeed = 0.5;
    private readonly mouseSensitivity = 0.002;


    constructor(dataProvider: GameRendererDataProvider) {
        this.dataProvider = dataProvider;
    }

    public updateMovement(keys: Set<string>) {

        const forwardPressed = keys.has('w') || keys.has('W');
        const backwardPressed = keys.has('s') || keys.has('S');
        const leftPressed = keys.has('a') || keys.has('A');
        const rightPressed = keys.has('d') || keys.has('D');

        if (!forwardPressed && !backwardPressed && !leftPressed && !rightPressed) {
            return;
        }

        this.dataProvider.updateCamera((cameraData: RenderCameraData) => {

            const forward = vec3.clone(cameraData.direction);

            const right = vec3.create();
            vec3.cross(right, forward, cameraData.up);
            vec3.normalize(right, right);

            const moveDirection = vec3.create();
            if (forwardPressed) vec3.add(moveDirection, moveDirection, forward);
            if (backwardPressed) vec3.sub(moveDirection, moveDirection, forward);
            if (rightPressed) vec3.sub(moveDirection, moveDirection, right);
            if (leftPressed) vec3.add(moveDirection, moveDirection, right);

            if (vec3.length(moveDirection) > 0) {
                vec3.scale(moveDirection, moveDirection, this.moveSpeed);
                vec3.normalize(moveDirection, moveDirection);
                vec3.add(cameraData.position, cameraData.position, moveDirection);
                cameraData.revId++;
            }
        });

    }

    public handleMouseMove(mx: number, my: number, _x: number, _y: number, buttons: number) {
        if ((buttons & 1) !== 1) {
            return;
        }

        this.dataProvider.updateCamera((cameraData: RenderCameraData) => {
            const localRight = vec3.create();
            vec3.cross(localRight, cameraData.direction, cameraData.up);
            vec3.normalize(localRight, localRight);

            let pitchAngle = -my * this.mouseSensitivity;

            const currentDot = vec3.dot(cameraData.direction, cameraData.up);

            if ((currentDot > 0.98 && pitchAngle > 0) || (currentDot < -0.98 && pitchAngle < 0)) {
                pitchAngle = 0; // Block further pitch rotation in that direction
            }

            const yawRotation = quat.create();
            quat.setAxisAngle(yawRotation, cameraData.up, mx * this.mouseSensitivity);

            const pitchRotation = quat.create();
            quat.setAxisAngle(pitchRotation, localRight, pitchAngle);

            const combinedRotation = quat.create();
            quat.multiply(combinedRotation, yawRotation, pitchRotation);

            vec3.transformQuat(cameraData.direction, cameraData.direction, combinedRotation);
            vec3.normalize(cameraData.direction, cameraData.direction);

        })

    }

}