import {UID} from "../../../../../common/uid";
import {openWindow, useCloseWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import React from "react";
import {TileImprovementConstructionWindow} from "./TileImprovementConstructionWindow";
import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {WorldObjectComponent} from "../../../../../models/worldobject/worldObjectComponent";
import {useWorldObjectById} from "../../../../../app/game/worldobject/game.worldobject.hook.by-id";
import {constructTileImprovement} from "../../../../../app/game/tileimprovement/game-tileimprovement.construct";

export namespace UseTileImprovementConstructionWindow {

    export function open(worldObjectId: WorldObject.Id) {
        const windowId = UID.generate();
        openWindow({
            id: windowId,
            anchor: WindowStore.ANCHOR_CENTER_POINT,
            blockOthers: true,
            content: <TileImprovementConstructionWindow windowId={windowId} worldObjectId={worldObjectId}/>,
        });
    }

    export interface Data {
        options: ConstructionOption[],
        construct: (entry: ConstructionOption) => void;
    }

    export interface ConstructionOption {
        type: string;
        available: boolean;
    }

    export function useData(windowId: string, worldObjectId: WorldObject.Id): Data {
        const closeWindow = useCloseWindow();
        const worldObject = useWorldObjectById(worldObjectId);
        if (worldObject) {
            return {
                options: WorldObjectComponent.get(worldObject, WorldObjectComponent.Type.Builder).options,
                construct: (entry: ConstructionOption) => {
                    constructTileImprovement(worldObjectId, entry.type);
                    closeWindow(windowId);
                },
            };
        } else {
            return {
                options: [],
                construct: (_: any) => undefined,
            };
        }
    }

}
