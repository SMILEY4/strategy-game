import React from "react";
import {ProductionWindow} from "./ProductionWindow";
import {ProductionOptionAggregate} from "../../../../../models/aggregates/SettlementAggregate";
import {useDI} from "../../../../../appContext";
import {SettlementAggregateAccess} from "../../../../../state/settlementAggregateAccess";
import {SettlementService} from "../../../../../logic/game/settlementService";
import {openWindow, useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {SettlementIdentifier} from "../../../../../models/base/Settlement";

export namespace UseProductionWindow {

    export function useOpen() {
        const WINDOW_ID = "production";
        const open = useOpenWindow();
        return (settlementId: string) => {
            open({
                id: WINDOW_ID,
                anchor: WindowStore.ANCHOR_CENTER_POINT,
                preferredHeight: "50vh",
                content: <ProductionWindow windowId={WINDOW_ID} settlementId={settlementId}/>,
            });
        };
    }

    export function open(settlementId: string) {
        const WINDOW_ID = "production";
        openWindow({
            id: WINDOW_ID,
            anchor: WindowStore.ANCHOR_CENTER_POINT,
            content: <ProductionWindow windowId={WINDOW_ID} settlementId={settlementId}/>,
        });
    }

    export interface Data {
        entries: ProductionOptionAggregate[];
        settlement: SettlementIdentifier,
        produce: (entry: ProductionOptionAggregate) => void;
    }


    export function useData(settlementId: string): UseProductionWindow.Data {
        const settlement = SettlementAggregateAccess.useSettlementAggregate(settlementId)!;
        const service = useDI<SettlementService>(SettlementService.name);
        return {
            settlement: settlement.identifier,
            entries: settlement.production.options,
            produce: (entry: ProductionOptionAggregate) => service.addProductionQueue(settlement.identifier, entry.type),
        };
    }

}