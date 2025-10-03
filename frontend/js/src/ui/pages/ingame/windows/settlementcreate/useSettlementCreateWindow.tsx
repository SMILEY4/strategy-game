import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {UID} from "../../../../../common/uid";
import {openWindow, useCloseWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {SettlementCreateWindow} from "./SettlementCreateWindow";
import {useEffect} from "react";
import {App} from "../../../../../appContext";
import {GameStateHooks} from "../../../../../state/gameStateHooks";
import {Interaction} from "../../../../../models/misc/interaction";

export namespace UseSettlementCreateWindow {

    export function open(worldObjectId: WorldObject.Id) {
        const windowId = UID.generate();
        openWindow({
            id: windowId,
            blockOthers: true,
            anchor: WindowStore.ANCHOR_BOTTOM_POINT,
            content: <SettlementCreateWindow windowId={windowId} worldObjectId={worldObjectId}/>,
        });
    }

    /**
     * The data and functions required by the "found settlement" window
     */
    export interface Data {
        input: {
            valid: boolean,
            reasonsInvalid: string[]
            name: {
                value: string,
                set: (value: string) => void
            }
        };
        hasSelectedTile: boolean,
        randomizeName: () => void;
        cancel: () => void;
        create: () => void;
    }

    /**
     * Provides the data and functions required by the window
     */
    export function useData(windowId: string, worldObjectId: WorldObject.Id): UseSettlementCreateWindow.Data {

        const closeWindow = useCloseWindow();
        const interactionState = GameStateHooks.useInteractionStateByType(Interaction.Type.CreateSettlement);

        useEffect(() => {
            App.gameProxy.beginCreateSettlement(worldObjectId);
        }, []);

        return {
            input: {
                valid: (interactionState?.validationErrors ?? []).length === 0,
                reasonsInvalid: [],
                name: {
                    value: interactionState?.name ?? "",
                    set: name => App.gameProxy.setSettlementName(name),
                },
            },
            hasSelectedTile: interactionState?.location !== null,
            randomizeName: () => App.gameProxy.setSettlementName(null),
            cancel: () => {
                App.gameProxy.cancelCreateSettlement();
                closeWindow(windowId);
            },
            create: () => {
                App.gameProxy.createSettlement();
                closeWindow(windowId);
            },
        };
    }
}