import React from "react";
import {RealmWindow} from "./RealmWindow";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {RealmId} from "../../../../../models/country/realmId";
import {Realm} from "../../../../../models/country/realm";
import {GameStateHooks} from "../../../../../state/gameStateHooks";
import {WorldObjectSummary} from "../../../../../models/worldobject/worldObjectSummary";
import {UseWorldObjectWindow} from "../worldobject/useWorldObjectWindow";

export namespace UseRealmWindow {

	export function open(identifier: RealmId | null) {
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
		open: {
			worldObject: (worldObject: WorldObjectSummary) => void,
		}
	}

	export function useData(realmId: RealmId | null): UseRealmWindow.Data | null {

		const realm = GameStateHooks.useRealm(realmId);

		if (realm) {
			return {
				realm: realm,
				open: {
					worldObject: worldObject => UseWorldObjectWindow.open(worldObject.id),
				},
			};
		} else {
			return null;
		}
	}

}