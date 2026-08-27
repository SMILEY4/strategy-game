import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import {useQuerySingle, useQuerySingleton} from "@modules/gamedb/adapters/use-database.ts";
import {DI} from "@app/app.ts";
import {TileQueries} from "@app/features/game/database/tile.database.ts";
import {CreateSettlementInteraction} from "@app/features/game/gameplay/create-settlement.interaction.ts";
import {useCreateSettlementValidation} from "@app/features/game/gameplay/create-settlement.validation.ts";

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

    const validate = useCreateSettlementValidation();

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
            available: selectedTile ? validate.firstSettlement(selectedTile.position) : false,
            execute: () => {
                if (selectedTileRef) {
                    void DI.interactionManager.start(CreateSettlementInteraction, {position: selectedTile!.position});
                }
            },
        },
    };
}