import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import {useQuerySingle, useQuerySingleton} from "@modules/gamedb/adapters/use-database.ts";
import {DI} from "@app/app.ts";
import {TileQueries} from "@app/features/game/database/tile.database.ts";

export interface InfoPanelViewModel {
    tile: null | {
        id: string,
        position: HexPosition,
        terrain: null | {
            elevation: string,
            biome: string,
            feature: string,
        }
    },
    foundCapital: {
        available: boolean,
        execute: () => void
    }
}

export function useInfoPanelViewModel(): InfoPanelViewModel {

    const selectedTileRef = useQuerySingleton(DI.selectedTileDatabase).selected;
    const selectedTile = useQuerySingle(DI.tileDatabase, TileQueries.BY_ID, selectedTileRef?.id);

    return {
        tile: selectedTileRef
            ? {
                id: selectedTileRef.id,
                position: {q: selectedTileRef.q, r: selectedTileRef.r},
                terrain: (selectedTile && selectedTile.world.visible)
                    ? {
                        elevation: selectedTile.world.value.elevation,
                        biome: selectedTile.world.value.biome,
                        feature: selectedTile.world.value.feature,
                    }
                    : null,
            }
            : null,
        foundCapital: {
            available: selectedTileRef ? DI.gameActionFoundCapital.validate(selectedTileRef) : false,
            execute: () => {
                if (selectedTileRef) {
                    DI.gameActionFoundCapital.execute(selectedTileRef);
                }
            },
        },
    };
}