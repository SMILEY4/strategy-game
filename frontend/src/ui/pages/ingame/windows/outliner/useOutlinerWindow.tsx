import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import React from "react";
import {OutlinerWindow} from "./OutlinerWindow";
import {UseSettlementWindow} from "../settlement/useSettlementWindow";
import {UseWorldObjectWindow} from "../worldobject/useWorldObjectWindow";
import {CountryOutline} from "../../../../../models/base/country";
import {WindowGroup} from "../windowGroups";
import {UID} from "../../../../../common/uid";
import {LocalStateHooks} from "../../../../../state/local/access/localStateHooks";
import {INTERFACE_SERVICE} from "../../../../../logic/game/interfaceService";
import {SettlementOutline} from "../../../../../models/settlement/settlementOutline";

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
			entries: SettlementOutline[],
			open: (outline: SettlementOutline) => void,
			focusCamera: (outline: SettlementOutline) => void,
		},
		worldObjects: {
			entries: WorldObjectOutline[],
			open: (outline: WorldObjectOutline) => void,
			focusCamera: (outline: WorldObjectOutline) => void,
		},
		countries: {
			entries: CountryOutline[],
		}
	}

	export function useData(): UseOutlinerWindow.Data {

		const countries = LocalStateHooks.useOutlineCountries();
		const settlements = LocalStateHooks.useOutlineSettlements();
		const units = LocalStateHooks.useOutlineUnits();

		return {
			settlements: {
				entries: settlements,
				open: (outline: SettlementOutline) => UseSettlementWindow.open(outline.id),
				focusCamera: (outline: SettlementOutline) => INTERFACE_SERVICE.focusCamera(outline.tile),
			},
			worldObjects: {
				entries: units,
				open: (outline: WorldObjectOutline) => UseWorldObjectWindow.open(outline.identifier),
				focusCamera: (outline: WorldObjectOutline) => INTERFACE_SERVICE.focusCamera(outline.tile),
			},
			countries: {
				entries: countries,
			},
		};
	}

}