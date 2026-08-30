import {type HexPosition, INVALID_HEX_POSITION} from "@app/features/game/models/hex-position.ts";
import {useQueryMultiple, useQuerySingle, useQuerySingleton} from "@modules/gamedb/adapters/use-database.ts";
import {DI} from "@app/app.ts";
import {TileQueries} from "@app/features/game/database/tile.database.ts";
import {CreateSettlementInteraction} from "@app/features/game/gameplay/create-settlement.interaction.ts";
import {useCreateSettlementValidation} from "@app/features/game/gameplay/create-settlement.validation.ts";
import {EntityQueries} from "@app/features/game/database/entity.database.ts";
import {EntityUtils} from "@app/features/game/models/entity.ts";

export interface QuickinfoViewModel {
    availableInfo: ("tile" | "settlement")[];
    tile: null | QuickInfoTileViewModel;
    settlement: null | QuickInfoSettlementViewModel;
}

export interface QuickInfoTileViewModel {
    id: number,
    position: HexPosition,
    terrain: null | {
        elevation: string,
        biome: string,
        feature: string,
    }
    control: ({ source: string, amount: number })[]
    actions: {
        focusCamera: () => void,
        foundSettlementFirst: {
            available: boolean,
            possible: boolean,
            execute: () => void
        }
        foundSettlement: {
            available: boolean,
            possible: boolean,
            execute: () => void
        }
    }
}


export interface QuickInfoSettlementViewModel {
    id: number;
    owner: number | null,
    name: string,
    isRealmCapital: boolean,
    actions: {
        focusCamera: () => void,
    }
}

export function useQuickInfoViewModel(): QuickinfoViewModel {

    const selectedTileRef = useQuerySingleton(DI.selectedTileDatabase).selected;

    const tileQuickInfo = useBuildTileQuickInfo(selectedTileRef);
    const settlementQuickInfo = useBuildSettlementQuickInfo(selectedTileRef);

    const availableInfo: ("tile" | "settlement")[] = [];
    if (tileQuickInfo) availableInfo.push("tile");
    if (settlementQuickInfo) availableInfo.push("settlement");

    return {
        availableInfo: availableInfo,
        tile: tileQuickInfo,
        settlement: settlementQuickInfo,
    };
}


function useBuildTileQuickInfo(tileRef: HexPosition & { id: number } | null): QuickInfoTileViewModel | null {

    const tile = useQuerySingle(DI.tileDatabase, TileQueries.BY_ID, tileRef?.id);

    const validate = useCreateSettlementValidation();

    if (!tile) {
        return null;
    }
    return {
        id: tile.id,
        position: tile.position,
        terrain: tile.world.visible
            ? {
                elevation: tile.world.value.elevation,
                biome: tile.world.value.biome,
                feature: tile.world.value.feature,
            }
            : null,
        control: tile.political.visible
            ? tile.political.value.control.map(it => ({
                source: it.realm + "/" + it.entity,
                amount: it.amount,
            }))
            : [],
        actions: {
            focusCamera: () => DI.cameraController.lookAt(tile.position),
            foundSettlementFirst: {
                available: validate.firstSettlementAvailable(),
                possible: validate.firstSettlement(tile.position),
                execute: () => void DI.interactionManager.start(CreateSettlementInteraction, {position: tile.position}),
            },
            foundSettlement: {
                available: validate.settlementAvailable(),
                possible: validate.settlement(tile.position),
                execute: () => void DI.interactionManager.start(CreateSettlementInteraction, {position: tile.position}),
            },
        },
    };
}

function useBuildSettlementQuickInfo(tileRef: HexPosition & { id: number } | null): QuickInfoSettlementViewModel | null {

    const settlementEntity = useQueryMultiple(DI.entityDatabase, EntityQueries.BY_POSITION, tileRef ?? INVALID_HEX_POSITION)
        .find(it => EntityUtils.hasComponent(it, "settlement"));

    if (!tileRef || !settlementEntity) {
        return null;
    }

    const settlementComponent = EntityUtils.getComponent(settlementEntity, "settlement")!;

    return {
        id: settlementEntity.id,
        owner: settlementEntity.owner,
        name: settlementComponent.name,
        isRealmCapital: settlementComponent.isRealmCapital,
        actions: {
            focusCamera: () => DI.cameraController.lookAt(settlementEntity.position),
        },
    };
}
