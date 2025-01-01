import React from "react";
import {ProductionQueueWindow} from "./ProductionQueueWindow";
import {useDI} from "../../../../../appContext";
import {SettlementAggregateAccess} from "../../../../../state/settlementAggregateAccess";
import {SettlementService} from "../../../../../logic/game/settlementService";
import {ProductionQueueEntry} from "../../../../../models/base/Settlement";
import {useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {mapHiddenOrDefault} from "../../../../../common/hiddenType";
import {SettlementAggregate} from "../../../../../models/aggregates/SettlementAggregate";
import {UID} from "../../../../../common/uid";

export namespace UseProductionQueueWindow {

    export function useOpen() {
        const open = useOpenWindow();
        return (settlementId: string) => {
            const windowId = UID.generate();
            open({
                id: windowId,
                anchor: WindowStore.ANCHOR_CENTER_POINT,
                content: <ProductionQueueWindow windowId={windowId} settlementId={settlementId}/>,
            });
        };
    }

    export interface Data {
        settlement: SettlementAggregate,
        entries: ProductionQueueEntry[],
        cancel: (entry: ProductionQueueEntry) => void
    }


    export function useData(settlementId: string): UseProductionQueueWindow.Data {
        const settlement = SettlementAggregateAccess.useSettlementAggregate(settlementId)!;
        const service = useDI<SettlementService>(SettlementService.name);
        return {
            settlement: settlement,
            entries: mapHiddenOrDefault(settlement.production.queue, [], it => it),
            cancel: (entry: ProductionQueueEntry) => service.cancelProductionQueue(settlement.identifier, entry),
        };
    }

}