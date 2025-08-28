import React from "react";
import {CountryWindow} from "./CountryWindow";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {CountryId} from "../../../../../models/country/countryId";
import {Country} from "../../../../../models/country/country";
import {GameStateHooks} from "../../../../../state/gameStateHooks";
import {SettlementSummary} from "../../../../../models/settlement/settlementSummary";
import {WorldObjectSummary} from "../../../../../models/worldobject/worldObjectSummary";
import {UseWorldObjectWindow} from "../worldobject/useWorldObjectWindow";
import {UseSettlementWindow} from "../settlement/useSettlementWindow";

export namespace UseCountryWindow {

	export function open(identifier: CountryId | null) {
		const windowId = UID.generate();
		openWindow({
			id: windowId,
			groupId: WindowGroup.LEFT_SIDEBAR,
			anchor: WindowStore.ANCHOR_LEFT_SIDE,
			content: <CountryWindow windowId={windowId} identifier={identifier}/>,
		});
	}

	export interface Data {
		country: Country,
		open: {
			worldObject: (worldObject: WorldObjectSummary) => void,
			settlement: (settlement: SettlementSummary) => void,
		}
	}

	export function useData(countryId: CountryId | null): UseCountryWindow.Data | null {

		const country = GameStateHooks.useCountry(countryId);

		if (country) {
			return {
				country: country,
				open: {
					worldObject: worldObject => UseWorldObjectWindow.open(worldObject.id),
					settlement: settlement => UseSettlementWindow.open(settlement.id),
				},
			};
		} else {
			return null;
		}
	}

}