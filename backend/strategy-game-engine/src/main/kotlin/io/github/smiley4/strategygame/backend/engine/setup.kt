package io.github.smiley4.strategygame.backend.engine

import io.github.smiley4.strategygame.backend.engine.application.core.GameStepImpl
import io.github.smiley4.strategygame.backend.engine.application.core.InitializePlayerImpl
import io.github.smiley4.strategygame.backend.engine.application.core.InitializeWorldImpl
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameStep
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializePlayer
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializeWorld
import org.koin.core.module.Module

fun Module.dependenciesEngine() {

    single<GameStep> { GameStepImpl() }
    single<InitializePlayer> { InitializePlayerImpl() }
    single<InitializeWorld> { InitializeWorldImpl(get()) }

}
