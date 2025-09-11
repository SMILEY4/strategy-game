import React from "react";
import {SettlementWindow} from "./SettlementWindow";
import {UseProductionWindow} from "../production/useProductionWindow";
import {UseProductionQueueWindow} from "../productionQueue/useProductionQueueWindow";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UseTileWindow} from "../tile/useTileWindow";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {Settlement} from "../../../../../models/settlement/settlement";
import {SettlementSummary} from "../../../../../models/settlement/settlementSummary";
import {SettlementId} from "../../../../../models/settlement/settlementId";
import {App} from "../../../../../appContext";
import {GameStateHooks} from "../../../../../state/gameStateHooks";
import {UseCountryWindow} from "../country/useCountryWindow";

export namespace UseSettlementWindow {

    export function open(settlementId: SettlementId) {
        const windowId = UID.generate();
        openWindow({
            id: windowId,
            groupId: WindowGroup.LEFT_SIDEBAR,
            anchor: WindowStore.ANCHOR_LEFT_SIDE,
            content: <SettlementWindow windowId={windowId} settlementId={settlementId}/>,
        });
    }

    export interface Data {
        settlement: Settlement;
        productionQueue: {
            addNew: () => void
            openList: () => void,
            cancelActive: () => void,
        };
        open: {
            settlement: (settlementId: string) => void,
            country: () => void,
            tile: () => void
        };
        centerCamera: () => void,
    }

    export function useData(settlementId: SettlementId): UseSettlementWindow.Data | null {

        const settlement = GameStateHooks.useSettlement(settlementId)

        if (settlement) {
            const settlementSummary = SettlementSummary.from(settlement);
            return {
                settlement: settlement,
                productionQueue: {
                    addNew: () => UseProductionWindow.open(settlementSummary),
                    openList: () => UseProductionQueueWindow.open(settlementSummary),
                    cancelActive: () => {
                        if(settlement.productionQueueActive.value) {
                            App.gameProxy.cancelProduction(settlementSummary, settlement.productionQueueActive.value.id)
                        }
                    },
                },
                open: {
                    settlement: (settlementId) => UseSettlementWindow.open(settlementId),
                    tile: () => UseTileWindow.open(settlement.tile.id),
                    country: () => UseCountryWindow.open(settlement.country.id),
                },
                centerCamera: () => App.gameProxy.focusCamera(settlement.tile.position),
            };
        } else {
            return null;
        }
    }

}