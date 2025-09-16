import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import React from "react";
import {OutlinerWindow} from "./OutlinerWindow";
import {UseWorldObjectWindow} from "../worldobject/useWorldObjectWindow";
import {WindowGroup} from "../windowGroups";
import {UID} from "../../../../../common/uid";
import {WorldObjectOutline} from "../../../../../models/worldobject/worldObjectOutline";
import {RealmOutline} from "../../../../../models/country/realmOutline";
import {App} from "../../../../../appContext";
import {GameStateHooks} from "../../../../../state/gameStateHooks";
import {UseRealmWindow} from "../realm/useRealmWindow";

export namespace UseOutlinerWindow {

	export function open() {
		const windowId = UID.generate();
		openWindow({
			id: windowId,
			groupId: WindowGroup.LEFT_SIDEBAR,
			anchor: WindowStore.ANCHOR_LEFT_SIDE,
			content: <OutlinerWindow windowId={windowId}/>,
		});
	}

	export interface Data {
		unit: {
			entries: WorldObjectOutline[],
			open: (outline: WorldObjectOutline) => void,
			focusCamera: (outline: WorldObjectOutline) => void,
		},
		realms: {
			entries: RealmOutline[],
			open: (outline: RealmOutline) => void,
		}
	}

	export function useData(): UseOutlinerWindow.Data {

		const realms = GameStateHooks.useOutlineRealms();
		const units = GameStateHooks.useOutlineUnits();

		return {
			unit: {
				entries: units,
				open: (outline: WorldObjectOutline) => UseWorldObjectWindow.open(outline.id),
				focusCamera: (outline: WorldObjectOutline) => App.gameProxy.focusCamera(outline.tile.position),
			},
			realms: {
				entries: realms,
				open: (outline: RealmOutline) => UseRealmWindow.open(outline.id),
			},
		};
	}

}