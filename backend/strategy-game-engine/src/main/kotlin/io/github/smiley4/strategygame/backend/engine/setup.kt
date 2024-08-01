package io.github.smiley4.strategygame.backend.engine

import io.github.smiley4.strategygame.backend.engine.edge.GameStep
import io.github.smiley4.strategygame.backend.engine.edge.InitializePlayer
import io.github.smiley4.strategygame.backend.engine.edge.InitializeWorld
import io.github.smiley4.strategygame.backend.engine.edge.MovementService
import io.github.smiley4.strategygame.backend.engine.module.GameStepImpl
import io.github.smiley4.strategygame.backend.engine.module.InitializePlayerImpl
import io.github.smiley4.strategygame.backend.engine.module.InitializeWorldImpl
import io.github.smiley4.strategygame.backend.engine.module.ingame.MovementServiceImpl
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventSystem
import io.github.smiley4.strategygame.backend.engine.module.core.steps.ResolveCommandsStep
import io.github.smiley4.strategygame.backend.engine.module.core.steps.RootUpdateStep
import io.github.smiley4.strategygame.backend.engine.module.core.steps.UpdateWorldStep
import io.github.smiley4.strategygame.backend.engine.moduleold.DiscoverMapArea
import io.github.smiley4.strategygame.backend.engine.moduleold.common.RouteGenerator
import io.github.smiley4.strategygame.backend.engine.moduleold.eco.EconomyPopFoodConsumptionProvider
import io.github.smiley4.strategygame.backend.engine.moduleold.eco.PopFoodConsumption
import org.koin.core.module.Module

fun Module.dependenciesEngine() {
    single<GameStep> { GameStepImpl(get()) }
    single<InitializePlayer> { InitializePlayerImpl() }
    single<InitializeWorld> { InitializeWorldImpl(get()) }
    single<DiscoverMapArea> { DiscoverMapArea() }
    single<MovementService> { MovementServiceImpl() }

    single<EconomyPopFoodConsumptionProvider> { PopFoodConsumption() }
    single<RouteGenerator> { RouteGenerator(get()) }

    single<GameEventSystem> {
        GameEventSystem().also {
            it.register(RootUpdateStep())
            it.register(ResolveCommandsStep(get()))
            it.register(UpdateWorldStep())
        }
    }

}
