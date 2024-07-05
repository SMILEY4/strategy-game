package io.github.smiley4.strategygame.backend.engine

import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.engine.edge.GameStep
import io.github.smiley4.strategygame.backend.engine.edge.InitializePlayer
import io.github.smiley4.strategygame.backend.engine.edge.InitializeWorld
import io.github.smiley4.strategygame.backend.engine.module.DiscoverMapArea
import io.github.smiley4.strategygame.backend.engine.module.GameStepImpl
import io.github.smiley4.strategygame.backend.engine.module.InitializePlayerImpl
import io.github.smiley4.strategygame.backend.engine.module.InitializeWorldImpl
import io.github.smiley4.strategygame.backend.engine.module.common.RouteGenerator
import io.github.smiley4.strategygame.backend.engine.module.eco.EconomyPopFoodConsumptionProvider
import io.github.smiley4.strategygame.backend.engine.module.eco.PopFoodConsumption
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENAddProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENCreateBuilding
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENCreateCity
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENDeleteMarker
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENPlaceMarker
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENPlaceScout
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENRemoveProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENUpdateCityGrowthProgress
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENUpdateCityInfluence
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENUpdateCityNetwork
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENUpdateCitySize
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENUpdateCityTileOwnership
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENUpdateEconomy
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENUpdateInfluenceOwnership
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENUpdateInfluenceVisibility
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENUpdateProductionQueue
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENUpdateScoutLifetime
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENUpgradeSettlementTier
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENValidateAddProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENValidateCreateCity
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENValidateOperationInvalid
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENValidatePlaceMarker
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENValidatePlaceScout
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENValidateRemoveProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.module.gamestep.GENValidateUpgradeSettlementTier
import org.koin.core.module.Module
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions

fun Module.dependenciesEngine() {
    single<GameStep> { GameStepImpl(get()) }
    single<InitializePlayer> { InitializePlayerImpl(get(), get()) }
    single<InitializeWorld> { InitializeWorldImpl(get()) }
    single<DiscoverMapArea> { DiscoverMapArea() }

    single<EconomyPopFoodConsumptionProvider> { PopFoodConsumption() }
    single<RouteGenerator> { RouteGenerator(get()) }

    single<EventSystem> { EventSystem() }
    single<GENCreateCity> { GENCreateCity(get()) } withOptions { createdAtStart() }
    single<GENUpdateCityInfluence> { GENUpdateCityInfluence(get(), get()) } withOptions { createdAtStart() }
    single<GENUpdateCityNetwork> { GENUpdateCityNetwork(get(), get()) } withOptions { createdAtStart() }
    single<GENUpdateCityTileOwnership> { GENUpdateCityTileOwnership(get()) } withOptions { createdAtStart() }
    single<GENUpdateInfluenceOwnership> { GENUpdateInfluenceOwnership(get(), get()) } withOptions { createdAtStart() }
    single<GENUpdateInfluenceVisibility> { GENUpdateInfluenceVisibility(get()) } withOptions { createdAtStart() }
    single<GENValidateCreateCity> { GENValidateCreateCity(get(), get()) } withOptions { createdAtStart() }
    single<GENValidatePlaceMarker> { GENValidatePlaceMarker(get()) } withOptions { createdAtStart() }
    single<GENPlaceMarker> { GENPlaceMarker(get()) } withOptions { createdAtStart() }
    single<GENDeleteMarker> { GENDeleteMarker(get()) } withOptions { createdAtStart() }
    single<GENValidatePlaceScout> { GENValidatePlaceScout(get(), get()) } withOptions { createdAtStart() }
    single<GENPlaceScout> { GENPlaceScout(get(), get()) } withOptions { createdAtStart() }
    single<GENValidateAddProductionQueueEntry> { GENValidateAddProductionQueueEntry(get()) } withOptions { createdAtStart() }
    single<GENAddProductionQueueEntry> { GENAddProductionQueueEntry(get()) } withOptions { createdAtStart() }
    single<GENValidateRemoveProductionQueueEntry> { GENValidateRemoveProductionQueueEntry(get()) } withOptions { createdAtStart() }
    single<GENRemoveProductionQueueEntry> { GENRemoveProductionQueueEntry(get(), get()) } withOptions { createdAtStart() }
    single<GENUpdateScoutLifetime> { GENUpdateScoutLifetime(get(), get()) } withOptions { createdAtStart() }
    single<GENUpdateEconomy> { GENUpdateEconomy(get(), get(), get(), get()) } withOptions { createdAtStart() }
    single<GENUpdateProductionQueue> { GENUpdateProductionQueue(get()) } withOptions { createdAtStart() }
    single<GENCreateBuilding> { GENCreateBuilding(get()) } withOptions { createdAtStart() }
    single<GENUpdateCityGrowthProgress> { GENUpdateCityGrowthProgress(get(), get()) } withOptions { createdAtStart() }
    single<GENUpdateCitySize> { GENUpdateCitySize(get()) } withOptions { createdAtStart() }
    single<GENValidateOperationInvalid> { GENValidateOperationInvalid(get()) } withOptions { createdAtStart() }
    single<GENValidateUpgradeSettlementTier> { GENValidateUpgradeSettlementTier(get()) } withOptions { createdAtStart() }
    single<GENUpgradeSettlementTier> { GENUpgradeSettlementTier(get()) } withOptions { createdAtStart() }
}
