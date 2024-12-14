import {openWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {SettlementWindow} from "./SettlementWindow";
import {useDI} from "../../../../../appContext";
import {UseProductionWindow} from "../production/useProductionWindow";
import {
	SettlementAggregate,
} from "../../../../../models/aggregates/SettlementAggregate";
import {SettlementAggregateAccess} from "../../../../../state/settlementAggregateAccess";
import {UseProductionQueueWindow} from "../productionQueue/useProductionQueueWindow";
import {SettlementService} from "../../../../../logic/game/settlementService";
import {ProductionQueueEntry} from "../../../../../models/base/Settlement";

export namespace UseSettlementWindow {

	export function useOpen() {
		const WINDOW_ID = "menubar-window";
		const openWindow = useOpenWindow();
		return (identifier: string | null) => {
			openWindow({
				id: WINDOW_ID,
				className: "settlement-window",
				left: 25,
				top: 60,
				bottom: 25,
				width: 360,
				content: <SettlementWindow windowId={WINDOW_ID} identifier={identifier}/>,
			});
		};
	}

	export function open(identifier: string | null) {
		const WINDOW_ID = "menubar-window";
		openWindow({
			id: WINDOW_ID,
			className: "settlement-window",
			left: 25,
			top: 60,
			bottom: 25,
			width: 360,
			content: <SettlementWindow windowId={WINDOW_ID} identifier={identifier}/>,
		});
	}

	export interface Data {
		settlement: SettlementAggregate;
		productionQueue: {
			activeEntry: ProductionQueueEntry | null
			add: () => void
			open: () => void,
			cancel: () => void,
		};
	}

	export function useData(identifier: string | null): UseSettlementWindow.Data | null {

		const settlement = SettlementAggregateAccess.useSettlementAggregate(identifier);

		const service = useDI<SettlementService>(SettlementService.name);

		const openProductionWindow = UseProductionWindow.useOpen();
		const openProductionQueueWindow = UseProductionQueueWindow.useOpen();

		if (settlement) {
			return {
				settlement: settlement,
				productionQueue: {
					activeEntry: settlement.production.queue.length === 0 ? null : settlement.production.queue[0],
					add: () => openProductionWindow(identifier!),
					open: () => openProductionQueueWindow(identifier!),
					cancel: () => settlement.production.queue.length > 0 && service.cancelProductionQueue(settlement.identifier, settlement.production.queue[0]),
				},
			};
		} else {
			return null;
		}
	}

}