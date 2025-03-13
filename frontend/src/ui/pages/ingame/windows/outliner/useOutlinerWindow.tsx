import {Settlement} from "../../../../../models/base/Settlement";
import {WorldObject} from "../../../../../models/base/worldObject";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import React from "react";
import {OutlinerWindow} from "./OutlinerWindow";
import {UseSettlementWindow} from "../settlement/useSettlementWindow";
import {UseWorldObjectWindow} from "../worldobject/useWorldObjectWindow";
import {Country} from "../../../../../models/base/country";
import {WindowGroup} from "../windowGroups";
import {UID} from "../../../../../common/uid";
import {LocalStateHooks} from "../../../../../state/local/access/localStateHooks";
import {INTERFACE_SERVICE} from "../../../../../logic/game/interfaceService";

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
		settlements: {
			entries: Settlement[],
			open: (entry: Settlement) => void,
			focusCamera: (entry: Settlement) => void,
		},
		worldObjects: {
			entries: WorldObject[],
			open: (entry: WorldObject) => void,
			focusCamera: (entry: WorldObject) => void,
		},
		countries: {
			entries: Country[],
		}
	}

	export function useData(): UseOutlinerWindow.Data {

		const countries = LocalStateHooks.useOutlineCountries();
		const settlements = LocalStateHooks.useOutlineSettlements();
		const units = LocalStateHooks.useOutlineUnits();

		return {
			settlements: {
				entries: settlements,
				open: (entry: Settlement) => UseSettlementWindow.open(entry.identifier),
				focusCamera: (entry: Settlement) => INTERFACE_SERVICE.focusCamera(entry.tile),
			},
			worldObjects: {
				entries: units,
				open: (entry: WorldObject) => UseWorldObjectWindow.open(entry.identifier),
				focusCamera: (entry: WorldObject) => INTERFACE_SERVICE.focusCamera(entry.tile),
			},
			countries: {
				entries: countries,
			},
		};
	}

}