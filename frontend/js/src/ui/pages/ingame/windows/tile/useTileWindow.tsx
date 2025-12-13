import React from "react";
import {TileWindow} from "./TileWindow";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {Tile} from "../../../../../models/tile/tile";
import {UseWorldObjectWindow} from "../unit/useWorldObjectWindow";
import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {WorldObjectSummary} from "../../../../../models/worldobject/worldObjectSummary";
import {CameraService} from "../../../../../app/game/camera/game.camera.service";
import {useWorldObjectByPosition} from "../../../../../app/game/worldobject/game.worldobject.hook.by-position";
import {useTileById} from "../../../../../app/game/tile/game.tile.hook.by-id";
import {useSelectedTile} from "../../../../../app/game/tile/game.tile.hook.selected";

export namespace UseTileWindow {

    export function open(identifier: Tile.Id | null) {
        const windowId = UID.generate();
        openWindow({
            id: windowId,
            groupId: WindowGroup.LEFT_SIDEBAR,
            anchor: WindowStore.ANCHOR_LEFT_SIDE,
            content: <TileWindow windowId={windowId} identifier={identifier}/>,
        });
    }

    export interface Data {
        tile: Tile;
        worldObjects: WorldObjectSummary[];
        open: {
            worldObject: (worldObjectId: WorldObject.Id) => void,
        };
        centerCamera: () => void,
    }

    export function useData(overwriteTile: Tile.Id | null): UseTileWindow.Data | null {

        const selectedTile = useSelectedTile();
        const tile = useTileById(overwriteTile ?? selectedTile?.id);
        const worldObjects = useWorldObjectByPosition(tile?.position);

        if (tile) {
            return {
                tile: tile,
                worldObjects: worldObjects,
                open: {
                    worldObject: worldObjectId => UseWorldObjectWindow.open(worldObjectId),
                },
                centerCamera: () => CameraService.centerOnTile(tile.position),
            };
        } else {
            return null;
        }
    }

}