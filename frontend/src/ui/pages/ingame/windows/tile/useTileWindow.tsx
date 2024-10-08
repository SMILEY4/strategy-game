import {openWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import {Tile, TileIdentifier} from "../../../../../models/primitives/tile";
import React from "react";
import {TileWindow} from "./TileWindow";
import {AppCtx} from "../../../../../appContext";
import {TileDatabase} from "../../../../../state/database/tileDatabase";
import {GameSessionDatabase} from "../../../../../state/database/gameSessionDatabase";
import {UseFoundSettlementWindow} from "../foundsettlement/useFoundSettlementWindow";

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
        settlement: {
            valid: boolean,
            found: () => void
        }
    }

    export function useData(overwriteTile: TileIdentifier | null): UseTileWindow.Data | null {

        const selectedTileIdentifier = GameSessionDatabase.useSelectedTile();
        const tile = AppCtx.TileDatabase().querySingle(TileDatabase.QUERY_BY_ID, (overwriteTile ?? selectedTileIdentifier)?.id ?? null);
        const openFoundSettlementWindow = UseFoundSettlementWindow.useOpen()

        if (tile) {
            return {
                tile: tile,
                settlement: {
                    valid: tile.createSettlement.direct,
                    found: () => openFoundSettlementWindow(tile.identifier, null)
                }
            };
        } else {
            return null;
        }
    }

}