import {openWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import {Tile, TileIdentifier, TileView} from "../../../../../models/tile";
import React from "react";
import {TileWindow} from "./TileWindow";
import {UseCityWindow} from "../city/useCityWindow";
import {UseCountryWindow} from "../country/useCountryWindow";
import {AppCtx} from "../../../../../appContext";
import {UseSettlementCreationWindow} from "../cityCreation/useSettlementCreationWindow";
import {LocalGameDatabase} from "../../../../../state_new/localGameDatabase";
import {CommandDatabase} from "../../../../../state_new/commandDatabase";
import {TileDatabase} from "../../../../../state_new/tileDatabase";

export namespace UseTileWindow {

    export function useOpen() {
        const WINDOW_ID = "menubar-window";
        const openWindow = useOpenWindow();
        return (identifier: TileIdentifier | null) => {
            openWindow({
                id: WINDOW_ID,
                className: "tile-window",
                left: 25,
                top: 60,
                bottom: 25,
                width: 360,
                content: <TileWindow windowId={WINDOW_ID} identifier={identifier}/>,
            });
        };
    }

    export function open(identifier: TileIdentifier | null) {
        const WINDOW_ID = "menubar-window";
        openWindow({
            id: WINDOW_ID,
            className: "tile-window",
            left: 25,
            top: 60,
            bottom: 25,
            width: 360,
            content: <TileWindow windowId={WINDOW_ID} identifier={identifier}/>,
        });
    }

    export interface Data {
        tile: TileView;
        openWindow: {
            country: () => void,
            city: () => void,
            createSettlement: () => void;
            createColony: () => void;
        },
        scout: {
            place: () => void
        },
        createSettlement: {
            valid: boolean,
            reasonsInvalid: string[]
        },
        createColony: {
            valid: boolean,
            reasonsInvalid: string[]
        }
    }

    export function useData(overwriteTile: TileIdentifier | null): UseTileWindow.Data | null {

        const commands = CommandDatabase.useCommands();
        const selectedTileIdentifier = LocalGameDatabase.useSelectedTile();
        const tile = TileDatabase.useTileById(overwriteTile === null ? selectedTileIdentifier : overwriteTile);
        const tileView = tile ? AppCtx.DataViewService().getTileView(tile, commands) : null;

        const openCity = UseCityWindow.useOpen();
        const openCountry = UseCountryWindow.useOpen();
        const openSettlementCreation = UseSettlementCreationWindow.useOpen();

        const [validCreateSettlement, reasonsValidationsSettlement] = useValidateCreateSettlement(tile, "placeholder", false);
        const [validCreateColony, reasonsValidationsColony] = useValidateCreateSettlement(tile, "placeholder", true);

        if (tileView) {
            return {
                tile: tileView,
                openWindow: {
                    country: () => tile?.owner?.country && openCountry(tile.owner.country.id, true),
                    city: () => tile?.owner?.city && openCity(tile.owner.city.id, true),
                    createSettlement: () => openSettlementCreation(tileView.identifier, false),
                    createColony: () => openSettlementCreation(tileView.identifier, true),
                },
                scout: {
                    place: () => AppCtx.CommandService().placeScout(tileView.identifier),
                },
                createSettlement: {
                    valid: validCreateSettlement,
                    reasonsInvalid: reasonsValidationsSettlement,
                },
                createColony: {
                    valid: validCreateColony,
                    reasonsInvalid: reasonsValidationsColony,
                },
            };
        } else {
            return null;
        }
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