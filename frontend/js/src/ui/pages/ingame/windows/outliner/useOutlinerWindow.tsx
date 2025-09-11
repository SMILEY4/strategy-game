import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import React from "react";
import {OutlinerWindow} from "./OutlinerWindow";
import {UseSettlementWindow} from "../settlement/useSettlementWindow";
import {UseWorldObjectWindow} from "../worldobject/useWorldObjectWindow";
import {WindowGroup} from "../windowGroups";
import {UID} from "../../../../../common/uid";
import {SettlementOutline} from "../../../../../models/settlement/settlementOutline";
import {WorldObjectOutline} from "../../../../../models/worldobject/worldObjectOutline";
import {CountryOutline} from "../../../../../models/country/countryOutline";
import {App} from "../../../../../appContext";
import {GameStateHooks} from "../../../../../state/gameStateHooks";
import {UseCountryWindow} from "../country/useCountryWindow";

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
			open: (outline: CountryOutline) => void,
		}
	}

	export function useData(): UseOutlinerWindow.Data {

		const countries = GameStateHooks.useOutlineCountries();
		const settlements = GameStateHooks.useOutlineSettlements();
		const units = GameStateHooks.useOutlineWorldObjects();

		return {
			settlements: {
				entries: settlements,
				open: (outline: SettlementOutline) => UseSettlementWindow.open(outline.id),
				focusCamera: (outline: SettlementOutline) => App.gameProxy.focusCamera(outline.tile.position),
			},
			worldObjects: {
				entries: units,
				open: (outline: WorldObjectOutline) => UseWorldObjectWindow.open(outline.id),
				focusCamera: (outline: WorldObjectOutline) => App.gameProxy.focusCamera(outline.tile.position),
			},
			countries: {
				entries: countries,
				open: (outline: CountryOutline) => UseCountryWindow.open(outline.id),
			},
		};
	}

}