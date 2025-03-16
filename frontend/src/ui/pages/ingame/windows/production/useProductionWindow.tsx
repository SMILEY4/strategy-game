import React from "react";
import {ProductionWindow} from "./ProductionWindow";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {openWindow} from "../../../../components/window/windowHooks";
import {SettlementSummary} from "../../../../../models/settlement/settlementSummary";
import {SettlementProductionOption} from "../../../../../models/settlement/settlement";
import {App} from "../../../../../appContext";
import {GameStateHooks} from "../../../../../state/gameStateHooks";

export namespace UseProductionWindow {

	export function open(settlement: SettlementSummary) {
		const windowId = UID.generate();
		openWindow({
			id: windowId,
			anchor: WindowStore.ANCHOR_CENTER_POINT,
			preferredHeight: "50vh",
			content: <ProductionWindow windowId={windowId} settlement={settlement}/>,
		});
	}

	export interface Data {
		settlement: SettlementSummary,
		entries: SettlementProductionOption[];
		produce: (entry: SettlementProductionOption) => void;
	}


	export function useData(settlement: SettlementSummary): UseProductionWindow.Data {
		const options = GameStateHooks.useProductionOptions(settlement.id);
		return {
			settlement: settlement,
			entries: options,
			produce: (entry: SettlementProductionOption) => App.gameProxy.addProduction(settlement, entry),
		};
	}

}