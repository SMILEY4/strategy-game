import React from "react";
import {SettlementWindow} from "./SettlementWindow";
import {UseProductionWindow} from "../production/useProductionWindow";
import {SettlementAggregate} from "../../../../../models/aggregates/SettlementAggregate";
import {UseProductionQueueWindow} from "../productionQueue/useProductionQueueWindow";
import {ProductionQueueEntry, SettlementIdentifier} from "../../../../../models/base/Settlement";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UseTileWindow} from "../tile/useTileWindow";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {LocalStateHooks} from "../../../../../state/local/access/localStateHooks";
import {INTERFACE_SERVICE} from "../../../../../logic/game/interfaceService";

export namespace UseSettlementWindow {

    export function open(identifier: SettlementIdentifier) {
        const windowId = UID.generate();
        openWindow({
            id: windowId,
            groupId: WindowGroup.LEFT_SIDEBAR,
            anchor: WindowStore.ANCHOR_LEFT_SIDE,
            content: <SettlementWindow windowId={windowId} identifier={identifier}/>,
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
        open: {
            settlement: (settlementId: SettlementIdentifier) => void,
            tile: () => void
        };
        centerCamera: () => void,
    }

    export function useData(identifier: SettlementIdentifier): UseSettlementWindow.Data | null {

        const settlement = LocalStateHooks.useSettlement(identifier)
        const activeProductionEntry = LocalStateHooks.useProductionQueueActiveEntry()

        if (settlement) {
            return {
                settlement: settlement,
                productionQueue: {
                    activeEntry: activeProductionEntry,
                    add: () => UseProductionWindow.open(identifier),
                    open: () => UseProductionQueueWindow.open(identifier),
                    cancel: () => {
                        if(activeProductionEntry) {
                            INTERFACE_SERVICE.cancelProduction(identifier, activeProductionEntry)
                        }
                    },
                },
                open: {
                    settlement: (settlementId) => UseSettlementWindow.open(settlementId),
                    tile: () => UseTileWindow.open(settlement.tile),
                },
                centerCamera: () => INTERFACE_SERVICE.focusCamera(settlement.tile),
            };
        } else {
            return null;
        }
    }

}