import {openWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {SettlementWindow} from "./SettlementWindow";
import {AppCtx} from "../../../../../appContext";
import {useQuerySingle} from "../../../../../shared/db/adapters/databaseHooks";
import {Province} from "../../../../../models/primitives/province";
import {ProvinceDatabase} from "../../../../../state/database/provinceDatabase";
import {UseProductionWindow} from "../production/useProductionWindow";
import {
	ProductionQueueEntryAggregate,
	SettlementAggregate,
} from "../../../../../models/aggregates/SettlementAggregate";
import {SettlementAggregateAccess} from "../../../../../state/settlementAggregateAccess";
import {UseProductionQueueWindow} from "../productionQueue/useProductionQueueWindow";

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
		province: Province;
		productionQueue: {
			activeEntry: ProductionQueueEntryAggregate | null
			add: () => void
			open: () => void,
			cancel: () => void,
		};
	}

	export function useData(identifier: string | null): UseSettlementWindow.Data | null {

		const settlement = SettlementAggregateAccess.useSettlementAggregate(identifier);
		const province = useQuerySingle(AppCtx.ProvinceDatabase(), ProvinceDatabase.QUERY_BY_SETTLEMENT_ID, settlement?.identifier.id);

		const service = AppCtx.SettlementService();

		const openProductionWindow = UseProductionWindow.useOpen();
		const openProductionQueueWindow = UseProductionQueueWindow.useOpen();

		if (settlement && province) {
			return {
				settlement: settlement,
				province: province,
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