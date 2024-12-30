import React from "react";
import {ProductionQueueWindow} from "./ProductionQueueWindow";
import {useDI} from "../../../../../appContext";
import {SettlementAggregateAccess} from "../../../../../state/settlementAggregateAccess";
import {SettlementService} from "../../../../../logic/game/settlementService";
import {ProductionQueueEntry, SettlementIdentifier} from "../../../../../models/base/Settlement";
import {openWindow, useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {mapHiddenOrDefault} from "../../../../../common/hiddenType";

export namespace UseProductionQueueWindow {

    export function useOpen() {
        const WINDOW_ID = "production";
        const open = useOpenWindow();
        return (settlementId: string) => {
            open({
                id: WINDOW_ID,
                anchor: WindowStore.ANCHOR_CENTER_POINT,
                content: <ProductionQueueWindow windowId={WINDOW_ID} settlementId={settlementId}/>,
            });
        };
    }

    export function open(settlementId: string) {
        const WINDOW_ID = "production";
        openWindow({
            id: WINDOW_ID,
            anchor: WindowStore.ANCHOR_CENTER_POINT,
            content: <ProductionQueueWindow windowId={WINDOW_ID} settlementId={settlementId}/>,
        });
    }

    export interface Data {
        ownedByPlayer: boolean,
        settlement: SettlementIdentifier,
        entries: ProductionQueueEntry[],
        cancel: (entry: ProductionQueueEntry) => void
    }


    export function useData(settlementId: string): UseProductionQueueWindow.Data {
        const settlement = SettlementAggregateAccess.useSettlementAggregate(settlementId)!;
        const service = useDI<SettlementService>(SettlementService.name);
        return {
            ownedByPlayer: settlement.ownedByPlayer,
            settlement: settlement.identifier,
            entries: mapHiddenOrDefault(settlement.production.queue, [], it => it),
            cancel: (entry: ProductionQueueEntry) => service.cancelProductionQueue(settlement.identifier, entry),
        };
    }

}