import React, {useEffect} from "react";
import {MoveWindow} from "./MoveWindow";
import {openWindow, useCloseWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {gameInteractionEngine} from "../../../../../app/game/game.interaction-engine";
import {
    worldObjectMoveInteractionDefinition,
    WorldObjectMoveInteractionEvent,
} from "../../../../../app/game/worldobject/game.worldobject.interaction.move";
import {useWorldObjectMovement} from "../../../../../app/game/worldobject/game.worldobject.hook.move";
import {WorldObjectStateAccess} from "../../../../../app/game/worldobject/game.worldobject.state-access";

export namespace UseMoveWindow {

    /**
     * Opens the move world-object window
     */
    export function open(worldObjectId: WorldObject.Id) {
        const WINDOW_ID = "move-command";
        openWindow({
            id: WINDOW_ID,
            anchor: WindowStore.ANCHOR_BOTTOM_POINT,
            blockOthers: true,
            content: <MoveWindow windowId={WINDOW_ID} identifier={worldObjectId}/>,
        });
    }

    /**
     * The data and functions required by the window
     */
    export interface Data {
        remainingPoints: number,
        totalPoints: number
        cancel: () => void,
        accept: () => void
    }

    /**
     * Provides the data and functions required by the window
     */
    export function useData(windowId: string, worldObjectId: WorldObject.Id): UseMoveWindow.Data | null {

        const closeWindow = useCloseWindow();
        const worldObject = WorldObjectStateAccess.useWorldObjectById(worldObjectId);
        const movement = useWorldObjectMovement(worldObject);

        useEffect(() => {
            if (worldObject) {
                void gameInteractionEngine.start(worldObjectMoveInteractionDefinition, {
                    worldObject: worldObject,
                    path: [worldObject.tile],
                    targets: [],
                });
            }
        }, []);

        if (worldObject) {
            return {
                remainingPoints: movement.remainingMovement,
                totalPoints: movement.totalMovement,
                cancel: () => {
                    void gameInteractionEngine.dispatch<WorldObjectMoveInteractionEvent>({eventId: "CANCEL"});
                    closeWindow(windowId);
                },
                accept: () => {
                    void gameInteractionEngine.dispatch<WorldObjectMoveInteractionEvent>({eventId: "CONFIRM"});
                    closeWindow(windowId);
                },
            };
        } else {
            return null;
        }
    }

}