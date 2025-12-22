package io.github.smiley4.strategygame.backend.engine

import io.github.smiley4.strategygame.backend.engine.application.core.GameStepImpl
import io.github.smiley4.strategygame.backend.engine.application.core.GenericGameServiceImpl
import io.github.smiley4.strategygame.backend.engine.application.core.InitializePlayerImpl
import io.github.smiley4.strategygame.backend.engine.application.core.InitializeWorldImpl
import io.github.smiley4.strategygame.backend.engine.application.core.actions.ConstructRouteAction
import io.github.smiley4.strategygame.backend.engine.application.core.actions.UpdateEconomyAction
import io.github.smiley4.strategygame.backend.engine.application.core.actions.UpdateProductionAction
import io.github.smiley4.strategygame.backend.engine.application.core.actions.UpdateResourceNodesAction
import io.github.smiley4.strategygame.backend.engine.application.core.commandexecution.AddProductionQueueItemCommandExecutor
import io.github.smiley4.strategygame.backend.engine.application.core.commandexecution.ConstructTileImprovementCommandExecutor
import io.github.smiley4.strategygame.backend.engine.application.core.commandexecution.DisbandCommandExecutor
import io.github.smiley4.strategygame.backend.engine.application.core.commandexecution.MoveCommandExecutor
import io.github.smiley4.strategygame.backend.engine.application.core.commandexecution.SpawnSettlementCommandExecutor
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameStep
import io.github.smiley4.strategygame.backend.engine.ports.provided.GenericGameService
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializePlayer
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializeWorld
import org.koin.core.module.Module

fun Module.dependenciesEngine() {

    single<ConstructRouteAction> { ConstructRouteAction() }
    single<UpdateEconomyAction> { UpdateEconomyAction() }
    single<UpdateResourceNodesAction> { UpdateResourceNodesAction() }
    single<UpdateProductionAction> { UpdateProductionAction() }

    single<MoveCommandExecutor> { MoveCommandExecutor() }
    single<DisbandCommandExecutor> { DisbandCommandExecutor() }
    single<ConstructTileImprovementCommandExecutor> { ConstructTileImprovementCommandExecutor() }
    single<SpawnSettlementCommandExecutor> { SpawnSettlementCommandExecutor() }
    single<AddProductionQueueItemCommandExecutor> { AddProductionQueueItemCommandExecutor() }

    single<GameStep> { GameStepImpl(get(), get(), get(), get(), get(), get(), get(), get(), get()) }
    single<InitializePlayer> { InitializePlayerImpl(get()) }
    single<InitializeWorld> { InitializeWorldImpl(get()) }
    single<GenericGameService> { GenericGameServiceImpl() }

}
