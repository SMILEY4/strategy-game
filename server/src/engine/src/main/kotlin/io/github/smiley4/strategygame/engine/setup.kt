package io.github.smiley4.strategygame.engine

import io.github.smiley4.strategygame.engine.domain.GameEngineServiceImpl
import io.github.smiley4.strategygame.engine.domain.GameNotificationService
import io.github.smiley4.strategygame.engine.domain.GameRepository
import io.github.smiley4.strategygame.engine.domain.GameplayEngine
import io.github.smiley4.strategygame.engine.gameplay.GameStateRepository
import io.github.smiley4.strategygame.engine.gameplay.GameplayEngineImpl
import io.github.smiley4.strategygame.engine.infrastructure.InMemoryGameRepository
import io.github.smiley4.strategygame.engine.infrastructure.WebsocketNotificationService
import io.github.smiley4.strategygame.engine.infrastructure.WebsocketSessionManager
import org.koin.core.module.Module

fun Module.dependenciesEngine() {

    single<WebsocketSessionManager> { WebsocketSessionManager() }
    single<GameNotificationService> { WebsocketNotificationService(get()) }

    single<GameStateRepository> { InMemoryGameRepository() }
    single<GameRepository> { InMemoryGameRepository() }

    single<GameplayEngine> { GameplayEngineImpl(get(), get()) }

    single<GameEngineService> { GameEngineServiceImpl(get(), get()) }

}
