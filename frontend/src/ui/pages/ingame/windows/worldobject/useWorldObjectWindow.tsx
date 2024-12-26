import React from "react";
import {WorldObjectWindow} from "./WorldObjectWindow";
import {useDI} from "../../../../../appContext";
import {WorldObject} from "../../../../../models/base/worldObject";
import {UseMoveWindow} from "../move/useMoveWindow";
import {CommandType, MoveCommand} from "../../../../../models/base/command";
import {UseFoundSettlementWindow} from "../foundsettlement/useFoundSettlementWindow";
import {WorldObjectType} from "../../../../../models/base/worldObjectType";
import {WorldObjectRepository} from "../../../../../state/repository/worldObjectRepository";
import {TileRepository} from "../../../../../state/repository/tileRepository";
import {CommandRepository} from "../../../../../state/repository/commandRepository";
import {MovementService} from "../../../../../logic/game/movementService";
import {openWindow, useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";

export namespace UseWorldObjectWindow {

    export function useOpen() {
        const WINDOW_ID = "menubar-window";
        const open = useOpenWindow();
        return (identifier: string | null) => {
            open({
                id: WINDOW_ID,
                anchor: WindowStore.ANCHOR_LEFT_SIDE,
                content: <WorldObjectWindow windowId={WINDOW_ID} identifier={identifier}/>,
            });
        };
    }

    export function open(identifier: string | null) {
        const WINDOW_ID = "menubar-window";
        openWindow({
            id: WINDOW_ID,
            anchor: WindowStore.ANCHOR_LEFT_SIDE,
            content: <WorldObjectWindow windowId={WINDOW_ID} identifier={identifier}/>,
        });
    }

    export interface Data {
        worldObject: WorldObject;
        movement: {
            possible: boolean,
            enabled: boolean,
            canCancel: boolean,
            start: () => void,
            cancel: () => void
        };
        settlement: {
            possible: boolean
            enabled: boolean,
            start: () => void,
        };
    }

    export function useData(identifier: string | null): UseWorldObjectWindow.Data | null {

        const worldObject = WorldObjectRepository.useById(identifier);
        const tile = TileRepository.useById(worldObject?.tile);

        const hasCommand = CommandRepository.useAll().some(it => it.worldObjectId === identifier);
        const hasMoveCommand = CommandRepository.useAllByType<MoveCommand>(CommandType.MOVE).some(it => it.worldObjectId === identifier);

        const openMoveWindow = UseMoveWindow.useOpen();
        const openFoundSettlementWindow = UseFoundSettlementWindow.useOpen();

        if (worldObject) {
            return {
                worldObject: worldObject,
                movement: {
                    possible: worldObject.ownedByPlayer,
                    enabled: !hasCommand,
                    canCancel: hasMoveCommand,
                    start: () => identifier && openMoveWindow(worldObject.id),
                    cancel: () => cancelMovementCommand(worldObject),
                },
                settlement: {
                    possible: worldObject.ownedByPlayer && worldObject.type === WorldObjectType.SETTLER,
                    enabled: !hasCommand && (tile?.isValidSettlementLocation ?? false),
                    start: () => openFoundSettlementWindow(worldObject.tile, worldObject.id),
                },
            };
        } else {
            return null;
        }
    }

    function cancelMovementCommand(worldObject: WorldObject) {
        const movementService = useDI<MovementService>(MovementService.name);
        movementService.cancelMovementCommand(worldObject);
    }

}