import {Tile, TileIdentifier, TileObject} from "../../../../../models/base/tile";
import React from "react";
import {TileWindow} from "./TileWindow";
import {TileRepository} from "../../../../../state/repository/tileRepository";
import {openWindow, useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UseSettlementWindow} from "../settlement/useSettlementWindow";
import {UseWorldObjectWindow} from "../worldobject/useWorldObjectWindow";
import {useDI} from "../../../../../appContext";
import {CameraService} from "../../../../../logic/game/cameraService";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";

export namespace UseTileWindow {

    export function useOpen() {
        const open = useOpenWindow();
        return (identifier: TileIdentifier | null) => {
            const windowId = UID.generate();
            open({
                id: windowId,
                groupId: WindowGroup.LEFT_SIDEBAR,
                anchor: WindowStore.ANCHOR_LEFT_SIDE,
                content: <TileWindow windowId={windowId} identifier={identifier}/>,
            });
        };
    }

    export function open(identifier: TileIdentifier | null) {
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
        open: {
            controllingSettlement: () => void,
            tileObject: (tileObject: TileObject) => void,
        };
        centerCamera: () => void,
    }

    export function useData(overwriteTile: TileIdentifier | null): UseTileWindow.Data | null {

        const openSettlement = UseSettlementWindow.useOpen();
        const openWorldObject = UseWorldObjectWindow.useOpen();

        const cameraService = useDI<CameraService>(CameraService.name);

        const selectedTileIdentifier = TileRepository.useSelected();
        const tile = TileRepository.useById((overwriteTile ?? selectedTileIdentifier) ?? null);


        if (tile) {
            return {
                tile: tile,
                open: {
                    controllingSettlement: () => {
                        if (tile.political.value?.controlledBy?.settlement) {
                            openSettlement(tile.political.value?.controlledBy?.settlement!.id);
                        }
                    },
                    tileObject: (tileObject) => {
                        if (tileObject.worldObject !== null) {
                            openWorldObject(tileObject.worldObject.id);
                        }
                        if (tileObject.settlement !== null) {
                            openSettlement(tileObject.settlement.id);
                        }
                    },
                },
                centerCamera: () => cameraService.centerCameraOnTile(tile.identifier),
            };
        } else {
            return null;
        }
    }

}