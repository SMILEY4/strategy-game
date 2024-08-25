import {openWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {ProductionWindow} from "./ProductionWindow";
import {ProductionOptionAggregate} from "../../../../../models/aggregates/SettlementAggregate";
import {AppCtx} from "../../../../../appContext";
import {SettlementAggregateAccess} from "../../../../../state/settlementAggregateAccess";

export namespace UseProductionWindow {

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
				content: <ProductionWindow windowId={WINDOW_ID} settlementId={settlementId}/>,
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
			content: <ProductionWindow windowId={WINDOW_ID} settlementId={settlementId}/>,
		});
	}

	export interface Data {
		entries: ProductionOptionAggregate[];
		produce: (entry: ProductionOptionAggregate) => void;
	}


	export function useData(settlementId: string): UseProductionWindow.Data {
		const settlement = SettlementAggregateAccess.useSettlementAggregate(settlementId)!;
		const service = AppCtx.SettlementService();
		return {
			entries: settlement.production.options,
			produce: (entry: ProductionOptionAggregate) => service.addProductionQueue(settlement.identifier, entry.type),
		};
	}

}