import React from "react";
import {ProductionQueueWindow} from "./ProductionQueueWindow";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {openWindow} from "../../../../components/window/windowHooks";
import {LocalStateHooks} from "../../../../../state/localStateHooks";
import {SettlementSummary} from "../../../../../models/settlement/settlementSummary";
import {SettlementProductionQueueEntry} from "../../../../../models/settlement/settlement";
import {App} from "../../../../../appContext";

export namespace UseProductionQueueWindow {

	export function open(settlement: SettlementSummary) {
		const windowId = UID.generate();
		openWindow({
			id: windowId,
			anchor: WindowStore.ANCHOR_CENTER_POINT,
			content: <ProductionQueueWindow windowId={windowId} settlement={settlement}/>,
		});
	}

	export interface Data {
		settlement: SettlementSummary,
		entries: SettlementProductionQueueEntry[],
		cancel: (entry: SettlementProductionQueueEntry) => void
	}

	export function useData(settlement: SettlementSummary): UseProductionQueueWindow.Data {
		return {
			settlement: settlement,
			entries: LocalStateHooks.useProductionQueue(settlement.id),
			cancel: (entry: SettlementProductionQueueEntry) => App.interfaceService.cancelProduction(settlement, entry.id),
		};
	}

}