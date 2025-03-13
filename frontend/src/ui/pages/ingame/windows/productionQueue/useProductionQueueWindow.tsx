import React from "react";
import {ProductionQueueWindow} from "./ProductionQueueWindow";
import {ProductionQueueEntry, SettlementIdentifier} from "../../../../../models/base/Settlement";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {openWindow} from "../../../../components/window/windowHooks";
import {LocalStateHooks} from "../../../../../state/local/access/localStateHooks";
import {INTERFACE_SERVICE} from "../../../../../logic/game/interfaceService";

export namespace UseProductionQueueWindow {

	export function open(settlementId: SettlementIdentifier) {
		const windowId = UID.generate();
		openWindow({
			id: windowId,
			anchor: WindowStore.ANCHOR_CENTER_POINT,
			content: <ProductionQueueWindow windowId={windowId} settlementId={settlementId}/>,
		});
	}

	export interface Data {
		settlement: SettlementIdentifier,
		entries: ProductionQueueEntry[],
		cancel: (entry: ProductionQueueEntry) => void
	}


	export function useData(settlementId: SettlementIdentifier): UseProductionQueueWindow.Data {
		return {
			settlement: settlementId,
			entries: LocalStateHooks.useProductionQueue(settlementId),
			cancel: (entry: ProductionQueueEntry) => INTERFACE_SERVICE.cancelProduction(settlementId, entry),
		};
	}

}