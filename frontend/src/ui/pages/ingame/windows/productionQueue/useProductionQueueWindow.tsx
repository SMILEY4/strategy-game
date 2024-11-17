import {openWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {ProductionQueueWindow} from "./ProductionQueueWindow";
import {ProductionQueueEntryAggregate} from "../../../../../models/aggregates/SettlementAggregate";
import {useDI} from "../../../../../appContext";
import {SettlementAggregateAccess} from "../../../../../state/settlementAggregateAccess";
import {SettlementService} from "../../../../../logic/game/settlementService";

export namespace UseProductionQueueWindow {

	export function useOpen() {
		const WINDOW_ID = "production";
		const openWindow = useOpenWindow();
		return (settlementId: string) => {
			openWindow({
				id: WINDOW_ID,
				className: "production-window",
				left: 350,
				top: 350,
				width: 350,
				height: 400,
				content: <ProductionQueueWindow windowId={WINDOW_ID} settlementId={settlementId}/>,
			});
		};
	}

	export function open(settlementId: string) {
		const WINDOW_ID = "production";
		openWindow({
			id: WINDOW_ID,
			className: "production-window",
			left: 350,
			top: 350,
			width: 350,
			height: 400,
			content: <ProductionQueueWindow windowId={WINDOW_ID} settlementId={settlementId}/>,
		});
	}

	export interface Data {
		entries: ProductionQueueEntryAggregate[],
		cancel: (entry: ProductionQueueEntryAggregate) => void
	}


	export function useData(settlementId: string): UseProductionQueueWindow.Data {
		const settlement = SettlementAggregateAccess.useSettlementAggregate(settlementId)!;
		const service = useDI<SettlementService>(SettlementService.name);
		return {
			entries: settlement.production.queue,
			cancel: (entry: ProductionQueueEntryAggregate) => service.cancelProductionQueue(settlement.identifier, entry),
		};
	}

}