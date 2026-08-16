import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import type {Camera} from "@app/features/game/models/camera.ts";
import {vec3} from "gl-matrix";
import type {SingletonDatabase} from "@modules/gamedb/singleton/singleton-database.ts";

export type CameraDatabase = SingletonDatabase<Camera>

export function cameraDatabase(): CameraDatabase {
    return DatabaseBuilder
        .createSingleton<Camera>()
        .withInitialValue({
            up: vec3.fromValues(0, 1, 0),
            position: vec3.fromValues(-50, 40, 0),
            direction: vec3.fromValues(2, -1, 0),
            fov: 50,
            near: 0.1,
            far: 400,
            aspect: 1,
        })
        .build();
}