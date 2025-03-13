import React from "react";
import {WorldObjectWindow} from "./WorldObjectWindow";
import {WorldObject, WorldObjectIdentifier} from "../../../../../models/base/worldObject";
import {WorldObjectType} from "../../../../../models/base/worldObjectType";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {WindowGroup} from "../windowGroups";
import {UID} from "../../../../../common/uid";
import {LocalStateHooks} from "../../../../../state/local/access/localStateHooks";
import {UseMoveWindow} from "../move/useMoveWindow";
import {UseFoundSettlementWindow} from "../foundsettlement/useFoundSettlementWindow";
import {UseTileWindow} from "../tile/useTileWindow";
import {INTERFACE_SERVICE} from "../../../../../logic/game/interfaceService";
import {CommandType} from "../../../../../models/base/command";

export namespace UseWorldObjectWindow {

    export function open(identifier: WorldObjectIdentifier | null) {
        const windowId = UID.generate();
        openWindow({
            id: windowId,
            groupId: WindowGroup.LEFT_SIDEBAR,
            anchor: WindowStore.ANCHOR_LEFT_SIDE,
            content: <WorldObjectWindow windowId={windowId} identifier={identifier}/>,
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
        open: {
            tile: () => void
        }
        centerCamera: () => void,
    }

    export function useData(identifier: WorldObjectIdentifier | null): UseWorldObjectWindow.Data | null {

        const worldObject = LocalStateHooks.useWorldObject(identifier)
        const tile = LocalStateHooks.useTile(worldObject?.tile ? worldObject?.tile : null)

        const commands = LocalStateHooks.useCommands().filter(cmd => cmd.worldObjectId === identifier?.id)
        const hasCommand = commands.length > 0
        const moveCommand = commands.find(cmd => cmd.type === CommandType.MOVE)

        if (worldObject) {
            return {
                worldObject: worldObject,
                movement: {
                    possible: worldObject.country.isUserCountry,
                    enabled: !hasCommand,
                    canCancel: !!moveCommand,
                    start: () => identifier && UseMoveWindow.open(worldObject.identifier.id),
                    cancel: () => moveCommand && INTERFACE_SERVICE.commandCancel(moveCommand),
                },
                settlement: {
                    possible: worldObject.country.isUserCountry && worldObject.identifier.type === WorldObjectType.SETTLER,
                    enabled: !hasCommand && (tile?.isValidSettlementLocation ?? false),
                    start: () => UseFoundSettlementWindow.open(worldObject.tile, worldObject.identifier.id),
                },
                open: {
                    tile: () => UseTileWindow.open(worldObject.tile ?? null),
                },
                centerCamera: () => INTERFACE_SERVICE.focusCamera(worldObject.tile),
            };
        } else {
            return null;
        }
    }

}