import React from "react";
import {SettlementWindow} from "./SettlementWindow";
import {useDI} from "../../../../../appContext";
import {UseProductionWindow} from "../production/useProductionWindow";
import {SettlementAggregate} from "../../../../../models/aggregates/SettlementAggregate";
import {SettlementAggregateAccess} from "../../../../../state/settlementAggregateAccess";
import {UseProductionQueueWindow} from "../productionQueue/useProductionQueueWindow";
import {SettlementService} from "../../../../../logic/game/settlementService";
import {ProductionQueueEntry} from "../../../../../models/base/Settlement";
import {openWindow, useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UseTileWindow} from "../tile/useTileWindow";
import {CameraService} from "../../../../../logic/game/cameraService";

export namespace UseSettlementWindow {



    export function useOpen() {
        const WINDOW_ID = "menubar-window";
        const open = useOpenWindow();
        return (identifier: string | null) => {
            open({
                id: WINDOW_ID,
                anchor: WindowStore.ANCHOR_LEFT_SIDE,
                content: <SettlementWindow windowId={WINDOW_ID} identifier={identifier}/>,
            });
        };
    }

    export function open(identifier: string | null) {
        const WINDOW_ID = "menubar-window";
        openWindow({
            id: WINDOW_ID,
            anchor: WindowStore.ANCHOR_LEFT_SIDE,
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
        open: {
            settlement: (settlementId: string) => void,
            tile: () => void
        };
        centerCamera: () => void,
    }

    export function useData(identifier: string | null): UseSettlementWindow.Data | null {

        const openSettlement = UseSettlementWindow.useOpen();
        const openTile = UseTileWindow.useOpen();

        const settlement = SettlementAggregateAccess.useSettlementAggregate(identifier);

        const settlementService = useDI<SettlementService>(SettlementService.name);
        const cameraService = useDI<CameraService>(CameraService.name);

        const openProductionWindow = UseProductionWindow.useOpen();
        const openProductionQueueWindow = UseProductionQueueWindow.useOpen();

        if (settlement) {
            return {
                settlement: settlement,
                productionQueue: {
                    activeEntry: settlement.production.queue.visible
                        ? settlement.production.queue.value.length === 0 ? null : settlement.production.queue.value[0]
                        : null,
                    add: () => openProductionWindow(identifier!),
                    open: () => openProductionQueueWindow(identifier!),
                    cancel: () => {
                        if (settlement.country.isUserCountry && settlement.production.queue.visible) {
                            settlement.production.queue.value.length > 0 && settlementService.cancelProductionQueue(settlement.identifier, settlement.production.queue.value[0]);
                        }
                    },
                },
                open: {
                    settlement: (settlementId) => openSettlement(settlementId),
                    tile: () => openTile(settlement.tile),
                },
                centerCamera: () => cameraService.centerCameraOnTile(settlement.tile)
            };
        } else {
            return null;
        }
    }

}