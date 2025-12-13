import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {UID} from "../../../../../common/uid";
import {openWindow, useCloseWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {SettlementCreateWindow} from "./SettlementCreateWindow";
import {useEffect} from "react";
import {gameInteractionEngine} from "../../../../../app/game/game.interaction-engine";
import {
    SettlementCreateInteractionContext,
    settlementCreateInteractionDefinition,
    SettlementCreateInteractionEvent,
} from "../../../../../app/game/settlement/game.settlement.interaction.create";
import {
    useActiveInteractionId,
    useInteractionContext,
} from "../../../../../common/interactions/interaction.context-adapter";

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
        valid: boolean,
        reasonsInvalid: string[],
        input: {
            name: {
                value: string,
                set: (value: string) => void
            }
        };
        randomizeName: () => void;
        cancel: () => void;
        create: () => void;
    }

    /**
     * Provides the data and functions required by the window
     */
    export function useData(windowId: string, worldObjectId: WorldObject.Id): UseSettlementCreateWindow.Data {

        const closeWindow = useCloseWindow();
        const currentInteractionId = useActiveInteractionId();
        const currentInteractionContext = useInteractionContext();

        useEffect(() => {
            void gameInteractionEngine.start(settlementCreateInteractionDefinition, {
                worldObjectId: worldObjectId,
                validTiles: [],
                name: null,
                tile: null,
            });
        }, []);

        let name = ""
        let validName = false;
        let validTile = false;
        if(currentInteractionId === settlementCreateInteractionDefinition.id) {
            const context = currentInteractionContext as SettlementCreateInteractionContext;
            name = context.name ?? ""
            validName = !!context.name?.trim()
            validTile = !!context.tile
        }

        const reasonsInvalid = [
            ...(validName ? [] : ["invalid_name"]),
            ...(validTile ? [] : ["invalid_tile"]),
        ]

        console.log("validName", validName, "validTile", validTile, "->", (validName && validTile), "reasons", reasonsInvalid)

        return {
            valid: validName && validTile,
            reasonsInvalid: reasonsInvalid,
            input: {
                name: {
                    value: name,
                    set: name => {
                        void gameInteractionEngine.dispatch<SettlementCreateInteractionEvent>({
                            eventId: "SELECT_NAME",
                            name: name,
                        });
                    },
                },
            },
            randomizeName: () => {
                void gameInteractionEngine.dispatch<SettlementCreateInteractionEvent>({eventId: "SELECT_RANDOM_NAME"});
            },
            cancel: () => {
                void gameInteractionEngine.dispatch<SettlementCreateInteractionEvent>({eventId: "CANCEL"});
                closeWindow(windowId);
            },
            create: () => {
                void gameInteractionEngine.dispatch<SettlementCreateInteractionEvent>({eventId: "CONFIRM"});
                closeWindow(windowId);
            },
        };
    }
}