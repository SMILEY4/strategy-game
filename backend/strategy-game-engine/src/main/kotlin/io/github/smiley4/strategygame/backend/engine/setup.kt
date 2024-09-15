package io.github.smiley4.strategygame.backend.engine

import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyService
import io.github.smiley4.strategygame.backend.ecosim.module.ledger.ResourceLedgerDetailBuilder
import io.github.smiley4.strategygame.backend.engine.edge.GameStep
import io.github.smiley4.strategygame.backend.engine.edge.GameValidations
import io.github.smiley4.strategygame.backend.engine.edge.InitializePlayer
import io.github.smiley4.strategygame.backend.engine.edge.InitializeWorld
import io.github.smiley4.strategygame.backend.engine.edge.MovementService
import io.github.smiley4.strategygame.backend.engine.module.GameStepImpl
import io.github.smiley4.strategygame.backend.engine.module.InitializePlayerImpl
import io.github.smiley4.strategygame.backend.engine.module.InitializeWorldImpl
import io.github.smiley4.strategygame.backend.engine.module.ingame.MovementServiceImpl
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventSystem
import io.github.smiley4.strategygame.backend.engine.module.core.economy.ResourceLedgerDetailBuilderImpl
import io.github.smiley4.strategygame.backend.engine.module.core.steps.ResolveCommandCreateSettlement
import io.github.smiley4.strategygame.backend.engine.module.core.steps.ResolveCommandMove
import io.github.smiley4.strategygame.backend.engine.module.core.steps.ResolveCommandProductionQueue
import io.github.smiley4.strategygame.backend.engine.module.core.steps.ResolveCommandsStep
import io.github.smiley4.strategygame.backend.engine.module.core.steps.RootUpdateStep
import io.github.smiley4.strategygame.backend.engine.module.core.steps.UpdateEconomyStep
import io.github.smiley4.strategygame.backend.engine.module.core.steps.UpdateInfluenceStep
import io.github.smiley4.strategygame.backend.engine.module.core.steps.UpdateProductionQueueStep
import io.github.smiley4.strategygame.backend.engine.module.core.steps.UpdateWorldStep
import io.github.smiley4.strategygame.backend.engine.module.tools.GameValidationsImpl
import io.github.smiley4.strategygame.backend.engine.module.tools.InfluenceCalculator
import org.koin.core.module.Module

fun Module.dependenciesEngine() {
    single<GameStep> { GameStepImpl(get()) }
    single<InitializePlayer> { InitializePlayerImpl() }
    single<InitializeWorld> { InitializeWorldImpl(get()) }
    single<MovementService> { MovementServiceImpl() }

    single<GameValidations> { GameValidationsImpl() }
    single<InfluenceCalculator> { InfluenceCalculator() }
    single<ResourceLedgerDetailBuilder> { ResourceLedgerDetailBuilderImpl() }

    single<ResolveCommandMove> { ResolveCommandMove(get()) }
    single<ResolveCommandCreateSettlement> { ResolveCommandCreateSettlement(get()) }
    single<ResolveCommandProductionQueue> { ResolveCommandProductionQueue() }

    single<GameEventSystem> {
        GameEventSystem().also {
            it.register(RootUpdateStep())
            it.register(ResolveCommandsStep(get(), get(), get()))
            it.register(UpdateWorldStep())
            it.register(UpdateProductionQueueStep())
            it.register(UpdateEconomyStep(get(), get()))
            it.register(UpdateInfluenceStep(get()))
        }
    }

}
