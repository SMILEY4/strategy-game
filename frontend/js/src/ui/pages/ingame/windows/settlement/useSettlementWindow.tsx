import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {UID} from "../../../../../common/uid";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowGroup} from "../windowGroups";
import {WindowStore} from "../../../../components/window/windowStore";
import React from "react";
import {SettlementWindow} from "./SettlementWindow";
import {WorldObjectStateAccess} from "../../../../../app/game/worldobject/worldobject.state-access";
import {UseTileWindow} from "../tile/useTileWindow";
import {CameraService} from "../../../../../app/game/camera/camera.service";
import {WorldObjectComponent} from "../../../../../models/worldobject/worldObjectComponent";
import {WorldObjectDatabase} from "../../../../../app/database/worldObjectDatabase";
import {Db} from "../../../../../app/database";

export namespace UseSettlementWindow {

    export function open(worldObjectId: WorldObject.Id | null) {
        const windowId = UID.generate();
        openWindow({
            id: windowId,
            groupId: WindowGroup.LEFT_SIDEBAR,
            anchor: WindowStore.ANCHOR_LEFT_SIDE,
            content: <SettlementWindow windowId={windowId} identifier={worldObjectId}/>,
        });
    }

    export interface Data {
        worldObject: WorldObject;
        open: {
            tile: () => void
        }
        centerCamera: () => void,
        districts: {
            used: number,
            max: number
            districts: WorldObject[]
        }
    }

    export function useData(worldObjectId: WorldObject.Id | null): Data | null {

        const worldObject = WorldObjectStateAccess.useWorldObjectById(worldObjectId);

        if (worldObject) {

            const districtData = WorldObjectComponent.get(worldObject, WorldObjectComponent.Type.Districts)
            const tileImprovements = districtData.tileImprovements.map(id => Db.worldObject.querySingleOrThrow(WorldObjectDatabase.QUERY_BY_ID, id))

            return {
                worldObject: worldObject,
                open: {
                    tile: () => UseTileWindow.open(worldObject.tile.id ?? null),
                },
                centerCamera: () => CameraService.centerOnTile(worldObject.tile.position),
                districts: {
                    used: districtData.tileImprovements.length,
                    max: districtData.maxAmount,
                    districts: tileImprovements,
                }
            }
        } else {
            return null;
        }

    }


}