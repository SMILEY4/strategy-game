import React from "react";
import {ProductionWindow} from "./ProductionWindow";
import {ProductionOptionAggregate} from "../../../../../models/aggregates/SettlementAggregate";
import {useDI} from "../../../../../appContext";
import {SettlementAggregateAccess} from "../../../../../state/settlementAggregateAccess";
import {SettlementService} from "../../../../../logic/game/settlementService";
import {useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {SettlementIdentifier} from "../../../../../models/base/Settlement";
import {UID} from "../../../../../common/uid";

export namespace UseProductionWindow {

    export function useOpen() {
        const open = useOpenWindow();
        return (settlementId: string) => {
            const windowId = UID.generate();
            open({
                id: windowId,
                anchor: WindowStore.ANCHOR_CENTER_POINT,
                preferredHeight: "50vh",
                content: <ProductionWindow windowId={windowId} settlementId={settlementId}/>,
            });
        };
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