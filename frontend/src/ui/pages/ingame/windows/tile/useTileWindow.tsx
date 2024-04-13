import {openWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import {Tile, TileIdentifier} from "../../../../../models/tile";
import React from "react";
import {TileWindow} from "./TileWindow";
import {UseCityWindow} from "../city/useCityWindow";
import {UseCountryWindow} from "../country/useCountryWindow";
import {AppCtx} from "../../../../../appContext";
import {UseSettlementCreationWindow} from "../cityCreation/useSettlementCreationWindow";
import {TileDatabase} from "../../../../../state/tileDatabase";
import {GameSessionDatabase} from "../../../../../state/gameSessionDatabase";
import {UsePlaceMarkerWindow} from "../placeMarker/usePlaceMarker";
import {getHiddenOrNull} from "../../../../../models/hiddenType";

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
        tile: Tile;
        openWindow: {
            country: () => void,
            city: () => void,
            createSettlement: () => void;
            createColony: () => void;
            placeMarker: () => void;
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
        },
        marker: {
            canPlace: boolean,
            canDelete: boolean,
            delete: () => void,
        }
    }

    export function useData(overwriteTile: TileIdentifier | null): UseTileWindow.Data | null {

        const selectedTileIdentifier = GameSessionDatabase.useSelectedTile();
        const tile = AppCtx.TileDatabase().querySingle(TileDatabase.QUERY_BY_ID, (overwriteTile ?? selectedTileIdentifier)?.id ?? null);
        const owner = tile ? getHiddenOrNull(tile?.political.owner) : null

        const openCity = UseCityWindow.useOpen();
        const openCountry = UseCountryWindow.useOpen();
        const openSettlementCreation = UseSettlementCreationWindow.useOpen();
        const openPlaceMarker = UsePlaceMarkerWindow.useOpen()

        const [validCreateSettlement, reasonsValidationsSettlement] = useValidateCreateSettlement(tile, "placeholder", false);
        const [validCreateColony, reasonsValidationsColony] = useValidateCreateSettlement(tile, "placeholder", true);

        if (tile) {
            return {
                tile: tile,
                openWindow: {
                    country: () => owner?.country && openCountry(owner.country.id, true),
                    city: () => owner?.city && openCity(owner.city.id, true),
                    createSettlement: () => openSettlementCreation(tile.identifier, false),
                    createColony: () => openSettlementCreation(tile.identifier, true),
                    placeMarker: () => openPlaceMarker(tile.identifier)
                },
                scout: {
                    place: () => AppCtx.CommandService().placeScout(tile.identifier),
                },
                createSettlement: {
                    valid: validCreateSettlement,
                    reasonsInvalid: reasonsValidationsSettlement,
                },
                createColony: {
                    valid: validCreateColony,
                    reasonsInvalid: reasonsValidationsColony,
                },
                marker: {
                    canPlace: AppCtx.MarkerService().validatePlaceMarker(tile.identifier),
                    canDelete: AppCtx.MarkerService().validateDeleteMarker(tile.identifier),
                    delete: () => AppCtx.MarkerService().deleteMarker(tile.identifier),
                }
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