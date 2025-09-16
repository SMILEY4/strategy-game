package io.github.smiley4.strategygame.backend.engine

import io.github.smiley4.strategygame.backend.engine.application.core.GameStepImpl
import io.github.smiley4.strategygame.backend.engine.application.core.GenericGameServiceImpl
import io.github.smiley4.strategygame.backend.engine.application.core.InitializePlayerImpl
import io.github.smiley4.strategygame.backend.engine.application.core.InitializeWorldImpl
import io.github.smiley4.strategygame.backend.engine.application.core.commandexecution.DisbandCommandExecutor
import io.github.smiley4.strategygame.backend.engine.application.core.commandexecution.MoveCommandExecutor
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameStep
import io.github.smiley4.strategygame.backend.engine.ports.provided.GenericGameService
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializePlayer
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializeWorld
import org.koin.core.module.Module

fun Module.dependenciesEngine() {

    single<MoveCommandExecutor> { MoveCommandExecutor() }
    single<DisbandCommandExecutor> { DisbandCommandExecutor() }

    single<GameStep> { GameStepImpl(get(), get()) }
    single<InitializePlayer> { InitializePlayerImpl() }
    single<InitializeWorld> { InitializeWorldImpl(get()) }
    single<GenericGameService> { GenericGameServiceImpl() }

}
