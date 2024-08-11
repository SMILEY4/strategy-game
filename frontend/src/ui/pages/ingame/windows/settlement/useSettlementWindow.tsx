import {openWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {SettlementWindow} from "./SettlementWindow";
import {AppCtx} from "../../../../../appContext";
import {useQuerySingle} from "../../../../../shared/db/adapters/databaseHooks";
import {Settlement} from "../../../../../models/Settlement";
import {SettlementDatabase} from "../../../../../state/database/settlementDatabase";

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
		settlement: Settlement;
	}

	export function useData(identifier: string | null): UseSettlementWindow.Data | null {

		const settlement = useQuerySingle(AppCtx.SettlementDatabase(), SettlementDatabase.QUERY_BY_ID, identifier);

		if (settlement) {
			return {
				settlement: settlement,
			};
		} else {
			return null;
		}
	}

}