import {type EntityDatabase, EntityQueries} from "@app/features/game/database/entity.database.ts";
import type {CameraController} from "@app/features/game/gameplay/camera/camera-controller.ts";
import {EntityUtils} from "@app/features/game/models/entity.ts";
import type {HexPosition} from "@app/features/game/models/hex-position.ts";

export interface GameActionJoinedGame {
    execute: () => void;
}

interface Dependencies {
    entityDb: EntityDatabase,
    cameraController: CameraController
}

export const gameActionJoinedGame = ({entityDb, cameraController}: Dependencies): GameActionJoinedGame => ({
    execute: () => {

        const spawnEntity = entityDb.queryMany(EntityQueries.ALL, undefined)
            .find(it => EntityUtils.hasComponent(it, "player-spawn"));

        const initialLocation = spawnEntity
            ? spawnEntity.position
            : {q: 0, r: 0} satisfies HexPosition;

        cameraController.lookAt(initialLocation);
    },
});