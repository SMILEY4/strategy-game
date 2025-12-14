import React from "react";
import {RealmWindow} from "./RealmWindow";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {Realm} from "../../../../../models/realm/realm";
import {WorldObjectSummary} from "../../../../../models/worldobject/worldObjectSummary";
import {UseWorldObjectWindow} from "../unit/useWorldObjectWindow";
import {RealmStateAccess} from "../../../../../app/game/realm/game.realm.state-access";
import {WorldObjectStateAccess} from "../../../../../app/game/worldobject/game.worldobject.state-access";

export namespace UseRealmWindow {

    export function open(identifier: Realm.Id | null) {
        const windowId = UID.generate();
        openWindow({
            id: windowId,
            groupId: WindowGroup.LEFT_SIDEBAR,
            anchor: WindowStore.ANCHOR_LEFT_SIDE,
            content: <RealmWindow windowId={windowId} identifier={identifier}/>,
        });
    }

    export interface Data {
        realm: Realm,
        worldObjects: WorldObjectSummary[],
        open: {
            worldObject: (worldObject: WorldObjectSummary) => void,
        }
    }

    export function useData(realmId: Realm.Id | null): UseRealmWindow.Data | null {

        const realm = RealmStateAccess.useRealmById(realmId);
        const worldObjects = WorldObjectStateAccess.useWorldObjectByRealm(realmId);

        if (realm) {
            return {
                realm: realm,
                worldObjects: worldObjects.map(WorldObjectSummary.from),
                open: {
                    worldObject: worldObject => UseWorldObjectWindow.open(worldObject.id),
                },
            };
        } else {
            return null;
        }
    }

}