import {openWindow, useCloseWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {MoveWindow} from "./MoveWindow";
import {AppCtx} from "../../../../../appContext";
import {WorldObject} from "../../../../../models/worldObject";
import {WorldObjectDatabase} from "../../../../../state/database/objectDatabase";

export namespace UseMoveWindow {

    export function useOpen() {
        const WINDOW_ID = "move-command";
        const openWindow = useOpenWindow();
        return (worldObjectId: string) => {
            openWindow({
                id: WINDOW_ID,
                className: "move-window",
                bottom: 25,
                height: 160,
                width: 370,
                left: 1000,
                right: 1000,
                content: <MoveWindow windowId={WINDOW_ID} identifier={worldObjectId}/>,
            });
        };
    }

    export function open(worldObjectId: string) {
        const WINDOW_ID = "move-command";
        openWindow({
            id: WINDOW_ID,
            className: "move-window",
            bottom: 25,
            height: 160,
            width: 370,
            left: 1000,
            right: 1000,
            content: <MoveWindow windowId={WINDOW_ID} identifier={worldObjectId}/>,
        });
    }

    export interface Data {
        worldObject: WorldObject,
        cancel: () => void,
        accept: () => void
    }

    export function useData(worldObjectId: string | null): UseMoveWindow.Data | null {

        const worldObject = AppCtx.WorldObjectDatabase().querySingle(WorldObjectDatabase.QUERY_BY_ID, worldObjectId);
        const movementService = AppCtx.MovementService();
        const closeWindow = useCloseWindow();

        if (worldObject) {
            movementService.startMovement(worldObject.id, worldObject.tile)
            return {
                worldObject: worldObject,
                cancel: () => {
                    movementService.cancelMovement()
                    closeWindow("move-command");
                },
                accept: () => {
                    movementService.completeMovement()
                    closeWindow("move-command");
                }
            };
        } else {
            return null;
        }
    }

}