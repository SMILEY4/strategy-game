import React, {useEffect} from "react";
import {MoveWindow} from "./MoveWindow";
import {useDI} from "../../../../../appContext";
import {WorldObject} from "../../../../../models/base/worldObject";
import {WorldObjectRepository} from "../../../../../state/repository/worldObjectRepository";
import {MovementService} from "../../../../../logic/game/movementService";
import {openWindow, useCloseWindow, useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";

export namespace UseMoveWindow {

    /**
     * Returns a function to open the move world-object window
     */
    export function useOpen() {
        const open = useOpenWindow();
        return (worldObjectId: string) => {
            const windowId = UID.generate();
            open({
                id: windowId,
                anchor: WindowStore.ANCHOR_BOTTOM_POINT,
                blockOthers: true,
                content: <MoveWindow windowId={windowId} identifier={worldObjectId}/>,
            });
        };
    }

    /**
     * Opens the move world-object window
     */
    export function open(worldObjectId: string) {
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
        worldObject: WorldObject,
        remainingPoints: number,
        totalPoints: number
        cancel: () => void,
        accept: () => void
    }

    /**
     * Provides the data and functions required by the window
     */
    export function useData(windowId: string, worldObjectId: string | null): UseMoveWindow.Data | null {

        useRerenderOnPathChange();

        const worldObject = WorldObjectRepository.useById(worldObjectId);
        const movementService = useDI<MovementService>(MovementService.name);
        const closeWindow = useCloseWindow();

        useEffect(() => {
            if (worldObject) {
                movementService.startMovement(worldObject.identifier.id, worldObject.tile).then(_ => undefined);
            }
        }, []);

        if (worldObject) {
            return {
                worldObject: worldObject,
                remainingPoints: movementService.getMaxPathCost(worldObject) - movementService.getPathCost(),
                totalPoints: movementService.getMaxPathCost(worldObject),
                cancel: () => {
                    movementService.cancelMovement();
                    closeWindow(windowId);
                },
                accept: () => {
                    movementService.completeMovement();
                    closeWindow(windowId);
                },
            };
        } else {
            return null;
        }
    }

    function useRerenderOnPathChange() {
        const _ = WorldObjectRepository.useCurrentMovementPath(); // force re-render on changes
    }

}