import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import type {Camera} from "@app/features/game/models/camera.ts";
import {vec3} from "gl-matrix";
import type {SingletonDatabase} from "@modules/gamedb/singleton/singleton-database.ts";

export type CameraDatabase = SingletonDatabase<Camera>

export function cameraDatabase(): CameraDatabase {
    return DatabaseBuilder
        .createSingleton<Camera>()
        .withInitialValue({
            position: vec3.fromValues(0, 0, 0),
            direction: vec3.fromValues(0, 0, 0)
        })
        .build()
}