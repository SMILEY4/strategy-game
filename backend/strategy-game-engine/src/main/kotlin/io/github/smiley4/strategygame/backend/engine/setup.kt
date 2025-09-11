package io.github.smiley4.strategygame.backend.engine

import io.github.smiley4.strategygame.backend.engine.application.core.GameStepImpl
import io.github.smiley4.strategygame.backend.engine.application.core.InitializePlayerImpl
import io.github.smiley4.strategygame.backend.engine.application.core.InitializeWorldImpl
import io.github.smiley4.strategygame.backend.engine.application.core.ingame.MovementServiceImpl
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.CreatedBuildingEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.CreatedSettlementEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.EconomyUpdatedEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.OnResolveCommandsEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.OnUpdateWorldEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.RootEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.EconomyStep
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.PopulationStep
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.ResolveCommandsStep
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.RootStep
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.UpdateBuildingsStep
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.UpdateInfluenceStep
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.UpdateProductionQueueStep
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.UpdateRoutesStep
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.resolvecommand.ResolveCommandCreateSettlement
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.resolvecommand.ResolveCommandMove
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.resolvecommand.ResolveCommandProductionQueue
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.resolvecommand.ResolveDisbandWorldObject
import io.github.smiley4.strategygame.backend.engine.application.core.process.system.ProcessEventPublisher
import io.github.smiley4.strategygame.backend.engine.application.core.process.system.ProcessSystem
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
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions

fun Module.dependenciesEngine() {

    single<GameStep> { GameStepImpl(get()) }
    single<InitializePlayer> { InitializePlayerImpl(get()) }
    single<InitializeWorld> { InitializeWorldImpl(get()) }
    single<MovementService> { MovementServiceImpl() }

    single<GameValidations> { GameValidationsImpl() }
    single<SettlementUtilities> { SettlementUtilitiesImpl() }
    single<InfluenceCalculator> { InfluenceCalculator() }

    single<ResolveCommandMove> { ResolveCommandMove(get()) }
    single<ResolveCommandCreateSettlement> { ResolveCommandCreateSettlement(get(), get()) }
    single<ResolveCommandProductionQueue> { ResolveCommandProductionQueue() }
    single<ResolveDisbandWorldObject> { ResolveDisbandWorldObject() }

    single<EconomyStep> { EconomyStep(get(), get()) }
    single<ResolveCommandsStep> { ResolveCommandsStep(get(), get(), get(), get()) }
    single<RootStep> { RootStep(get()) }
    single<UpdateBuildingsStep.OnCreation> { UpdateBuildingsStep.OnCreation(get()) }
    single<UpdateBuildingsStep.OnUpdate> { UpdateBuildingsStep.OnUpdate(get()) }
    single<UpdateInfluenceStep> { UpdateInfluenceStep(get()) }
    single<UpdateProductionQueueStep> { UpdateProductionQueueStep(get()) }
    single<UpdateRoutesStep> { UpdateRoutesStep() }
    single<PopulationStep> { PopulationStep() }

    single<ProcessEventPublisher> { ProcessEventPublisher() }

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
                processStep(get<UpdateBuildingsStep.OnUpdate>())
                processStep(get<UpdateInfluenceStep>())
            }
            processSequence<EconomyUpdatedEvent>("economy-updated") {
                processStep(get<UpdateProductionQueueStep>())
                processStep(get<PopulationStep>())
            }
            processSequence<CreatedBuildingEvent>("created-building") {
                processStep(get<UpdateBuildingsStep.OnCreation>())
            }
            processSequence<CreatedSettlementEvent>("created-settlement") {
                processStep(get<UpdateRoutesStep>())
            }
        }.also { get<ProcessEventPublisher>().initialize(it) }
    } withOptions { createdAtStart() }

}
