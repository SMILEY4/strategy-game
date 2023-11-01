import {useCloseWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import {Tile, TileIdentifier} from "../../../../../models/tile";
import React, {useState} from "react";
import {SettlementCreationWindow} from "./SettlementCreationWindow";
import {TileRepository} from "../../../../../state/access/TileRepository";
import {AppCtx} from "../../../../../appContext";

export namespace UseSettlementCreationWindow {


    export function useOpen() {
        const WINDOW_ID = "settlement-creation-window";
        const addWindow = useOpenWindow();
        return (tile: TileIdentifier, asColony: boolean) => {
            addWindow({
                id: WINDOW_ID,
                className: "settlement-creation-window",
                left: 125,
                top: 160,
                width: 360,
                height: 170,
                content: <SettlementCreationWindow windowId={WINDOW_ID} tile={tile} asColony={asColony}/>,
            });
        };
    }

    export interface Data {
        input: {
            valid: boolean,
            reasonsInvalid: string[]
            name: {
                value: string,
                set: (value: string) => void
            }
        };
        cancel: () => void;
        create: () => void;
    }

    export function useData(windowId: string, tileIdentifier: TileIdentifier, asColony: boolean): UseSettlementCreationWindow.Data {

        const tile = TileRepository.useTileById(tileIdentifier)!;

        const [name, setName] = useState("");
        const [valid, failedValidations, create] = useCreateSettlement(tile, name, asColony);
        const closeWindow = useCloseWindow();

        return {
            input: {
                valid: valid,
                reasonsInvalid: failedValidations,
                name: {
                    value: name,
                    set: setName,
                },
            },
            cancel: () => closeWindow(windowId),
            create: () => {
                create();
                closeWindow(windowId);
            },
        };
    }


    function useCreateSettlement(tile: Tile, name: string | null, asColony: boolean): [boolean, string[], () => void] {
        const creationService = AppCtx.CityCreationService();
        const [possible, reasons] = useValidateCreateSettlement(tile, name, asColony);

        function perform() {
            creationService.create(tile, name!, asColony ? null : (tile.owner?.province ? tile.owner.province : null));
        }

        return [possible, reasons, perform];
    }

    function useValidateCreateSettlement(tile: Tile | null, name: string | null, asColony: boolean): [boolean, string[]] {
        if (tile) {
            const creationService = AppCtx.CityCreationService();
            const result = creationService.validate(tile, name, asColony);
            return [result.length === 0, result];
        } else {
            return [false, ["No tile selected"]];
        }
    }


}