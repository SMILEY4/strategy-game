import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import {useQuerySingleton} from "@modules/gamedb/adapters/use-database.ts";
import {DI} from "@app/app.ts";

export interface InfoPanelViewModel {
    tile: null | {
        id: string,
        position: HexPosition,
    },
    foundCapital: {
        available: boolean,
        execute: () => void
    }
}

export function useInfoPanelViewModel(): InfoPanelViewModel {

    const selectedTile = useQuerySingleton(DI.selectedTileDatabase).selected;

    return {
        tile: selectedTile
            ? {
                id: selectedTile.id,
                position: {q: selectedTile.q, r: selectedTile.r},
            }
            : null,
        foundCapital: {
            available: selectedTile ? DI.gameActionFoundCapital.validate(selectedTile) : false,
            execute: () => {
                if (selectedTile) {
                    DI.gameActionFoundCapital.execute(selectedTile);
                }
            },
        },
    };
}