import React from "react";
import {ProductionWindow} from "./ProductionWindow";
import {ProductionOptionAggregate} from "../../../../../models/aggregates/SettlementAggregate";
import {WindowStore} from "../../../../components/window/windowStore";
import {SettlementIdentifier} from "../../../../../models/base/Settlement";
import {UID} from "../../../../../common/uid";
import {openWindow} from "../../../../components/window/windowHooks";
import {LocalStateHooks} from "../../../../../state/local/access/localStateHooks";
import {INTERFACE_SERVICE} from "../../../../../logic/game/interfaceService";

export namespace UseProductionWindow {

	export function open(settlementId: SettlementIdentifier) {
		const windowId = UID.generate();
		openWindow({
			id: windowId,
			anchor: WindowStore.ANCHOR_CENTER_POINT,
			preferredHeight: "50vh",
			content: <ProductionWindow windowId={windowId} settlementId={settlementId}/>,
		});
	}

	export interface Data {
		entries: ProductionOptionAggregate[];
		settlement: SettlementIdentifier,
		produce: (entry: ProductionOptionAggregate) => void;
	}


	export function useData(settlementId: SettlementIdentifier): UseProductionWindow.Data {
		return {
			settlement: settlementId,
			entries: LocalStateHooks.useProductionOptions(settlementId),
			produce: (entry: ProductionOptionAggregate) => INTERFACE_SERVICE.addProduction(settlementId, entry),
		};
	}

}