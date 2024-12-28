import {Tile, TileIdentifier} from "../../../../../models/base/tile";
import React from "react";
import {TileWindow} from "./TileWindow";
import {TileRepository} from "../../../../../state/repository/tileRepository";
import {openWindow, useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UseSettlementWindow} from "../settlement/useSettlementWindow";
import {SettlementIdentifier} from "../../../../../models/base/Settlement";
import {WorldObjectIdentifier} from "../../../../../models/base/worldObject";
import {SettlementRepository} from "../../../../../state/repository/settlementRepository";
import {WorldObjectRepository} from "../../../../../state/repository/worldObjectRepository";
import {CountryIdentifier} from "../../../../../models/base/country";
import {UseWorldObjectWindow} from "../worldobject/useWorldObjectWindow";

export namespace UseTileWindow {

    export function useOpen() {
        const WINDOW_ID = "menubar-window";
        const open = useOpenWindow();
        return (identifier: TileIdentifier | null) => {
            open({
                id: WINDOW_ID,
                anchor: WindowStore.ANCHOR_LEFT_SIDE,
                content: <TileWindow windowId={WINDOW_ID} identifier={identifier}/>,
            });
        };
    }

    export function open(identifier: TileIdentifier | null) {
        const WINDOW_ID = "menubar-window";
        openWindow({
            id: WINDOW_ID,
            anchor: WindowStore.ANCHOR_LEFT_SIDE,
            content: <TileWindow windowId={WINDOW_ID} identifier={identifier}/>,
        });
    }

    export interface Data {
        tile: Tile;
        content: ({
            country: CountryIdentifier,
            settlement: SettlementIdentifier | null,
            worldObject: WorldObjectIdentifier | null,
			open: () => void
        })[];
        open: {
            controllingSettlement: () => void
        };
    }

    export function useData(overwriteTile: TileIdentifier | null): UseTileWindow.Data | null {

        const openSettlement = UseSettlementWindow.useOpen();
		const openWorldObject = UseWorldObjectWindow.useOpen();

        const selectedTileIdentifier = TileRepository.useSelected();
        const tile = TileRepository.useById((overwriteTile ?? selectedTileIdentifier) ?? null);

        const tilePos: [number, number] = tile?.identifier ? [tile.identifier.q, tile.identifier.r] : [9999, 9999];
        const settlements = SettlementRepository.useByPosition(tilePos);
        const worldObjects = WorldObjectRepository.useByPosition(tilePos);


        if (tile) {
            return {
                tile: tile,
                content: [
                    ...settlements.map(it => ({
                        country: it.country,
                        settlement: it.identifier,
                        worldObject: null,
						open: () => openSettlement(it.identifier.id)
                    })),
                    ...worldObjects.map(it => ({
                        country: it.country,
                        settlement: null,
                        worldObject: {
                            id: it.id,
                            type: it.type,
                        },
						open: () => openWorldObject(it.id)
                    })),
                ],
                open: {
                    controllingSettlement: () => {
                        if (tile.political.value?.controlledBy?.settlement) {
                            openSettlement(tile.political.value?.controlledBy?.settlement!.id);
                        }
                    },
                },
            };
        } else {
            return null;
        }
    }

}