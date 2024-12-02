package io.github.smiley4.strategygame.backend.engine

import io.github.smiley4.strategygame.backend.engine.application.core.GameStepImpl
import io.github.smiley4.strategygame.backend.engine.application.core.InitializePlayerImpl
import io.github.smiley4.strategygame.backend.engine.application.core.InitializeWorldImpl
import io.github.smiley4.strategygame.backend.engine.application.core.common.GameEventSystem
import io.github.smiley4.strategygame.backend.engine.application.core.ingame.MovementServiceImpl
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.OnResolveCommandsEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.OnUpdateWorldEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.RootEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.EconomyStep
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.ResolveCommandsStep
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.RootStep
import io.github.smiley4.strategygame.backend.engine.application.core.processsystem.ProcessEvent
import io.github.smiley4.strategygame.backend.engine.application.core.processsystem.ProcessEventPublisher
import io.github.smiley4.strategygame.backend.engine.application.core.processsystem.ProcessSystem
import io.github.smiley4.strategygame.backend.engine.application.core.steps.ResolveCommandCreateSettlement
import io.github.smiley4.strategygame.backend.engine.application.core.steps.ResolveCommandMove
import io.github.smiley4.strategygame.backend.engine.application.core.steps.RootUpdateStep
import io.github.smiley4.strategygame.backend.engine.application.core.steps.UpdateBuildingsStep
import io.github.smiley4.strategygame.backend.engine.application.core.steps.UpdateEconomyStep
import io.github.smiley4.strategygame.backend.engine.application.core.steps.UpdateInfluenceStep
import io.github.smiley4.strategygame.backend.engine.application.core.steps.UpdateProductionQueueStep
import io.github.smiley4.strategygame.backend.engine.application.core.tools.GameValidationsImpl
import io.github.smiley4.strategygame.backend.engine.application.core.tools.InfluenceCalculator
import io.github.smiley4.strategygame.backend.engine.application.core.tools.SettlementUtilitiesImpl
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameStep
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameValidations
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializePlayer
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializeWorld
import io.github.smiley4.strategygame.backend.engine.ports.provided.MovementService
import io.github.smiley4.strategygame.backend.engine.ports.provided.SettlementUtilities
import org.koin.core.module.Module
import org.koin.java.KoinJavaComponent.inject

fun Module.dependenciesEngine() {
    single<GameStep> { GameStepImpl(get()) }
    single<InitializePlayer> { InitializePlayerImpl() }
    single<InitializeWorld> { InitializeWorldImpl(get()) }
    single<MovementService> { MovementServiceImpl() }

    single<GameValidations> { GameValidationsImpl() }
    single<SettlementUtilities> { SettlementUtilitiesImpl() }
    single<InfluenceCalculator> { InfluenceCalculator() }

    single<ResolveCommandMove> { ResolveCommandMove(get()) }
    single<ResolveCommandCreateSettlement> { ResolveCommandCreateSettlement(get()) }
    single<io.github.smiley4.strategygame.backend.engine.application.core.steps.ResolveCommandProductionQueue> { io.github.smiley4.strategygame.backend.engine.application.core.steps.ResolveCommandProductionQueue() }

    single<GameEventSystem> {
        GameEventSystem().also {
            it.register(RootUpdateStep())
            it.register(io.github.smiley4.strategygame.backend.engine.application.core.steps.ResolveCommandsStep(get(), get(), get()))
            it.register(UpdateProductionQueueStep())
            it.register(UpdateEconomyStep(get()))
            it.register(UpdateInfluenceStep(get()))
            it.register(UpdateBuildingsStep.OnUpdate(get()))
            it.register(UpdateBuildingsStep.OnCreation(get()))
        }
    }

    single<ProcessEventPublisher> { ProcessEventPublisher() }

    single<RootStep> { RootStep(get()) }
    single<ResolveCommandsStep> { ResolveCommandsStep() }
    single<EconomyStep> { EconomyStep() }

    single<ProcessSystem> {
        ProcessSystem {
            processSequence<RootEvent>("root") {
                processStep(get<RootStep>())
            }
            processSequence<OnResolveCommandsEvent>("resolve-commands") {
                processStep(get<ResolveCommandsStep>())
            }
            processSequence<OnUpdateWorldEvent>("update-world") {
                processStep(get<EconomyStep>())
                //...
            }
        }.also { get<ProcessEventPublisher>().initialize(it) }
    }

}
