import {openWindow, useCloseWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import React, {useEffect} from "react";
import {MoveWindow} from "./MoveWindow";
import {AppCtx} from "../../../../../appContext";
import {WorldObject} from "../../../../../models/worldObject";
import {WorldObjectDatabase} from "../../../../../state/database/objectDatabase";
import {MovementModeState} from "../../../../../state/movementModeState";

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
                blockOthers: true,
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
            blockOthers: true,
            content: <MoveWindow windowId={WINDOW_ID} identifier={worldObjectId}/>,
        });
    }

    export interface Data {
        worldObject: WorldObject,
        remainingPoints: number,
        totalPoints: number
        cancel: () => void,
        accept: () => void
    }

    export function useData(worldObjectId: string | null): UseMoveWindow.Data | null {

        const _ = MovementModeState.useState(state => state.path) // re-render on changes

        const worldObject = AppCtx.WorldObjectDatabase().querySingle(WorldObjectDatabase.QUERY_BY_ID, worldObjectId);
        const movementService = AppCtx.MovementService();
        const closeWindow = useCloseWindow();

        useEffect(() => {
            if(worldObject) {
                movementService.startMovement(worldObject.id, worldObject.tile)
            }
        }, []);

        if (worldObject) {
            return {
                worldObject: worldObject,
                remainingPoints: 5 - movementService.getPathCost(),
                totalPoints: movementService.getMaxPathCost(),
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