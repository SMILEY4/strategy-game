package io.github.smiley4.strategygame.engine.game.domain

import io.github.smiley4.strategygame.engine.game.GameEngineService
import io.github.smiley4.strategygame.shared.domain.events.GameGenerationRequestedEvent
import io.github.smiley4.strategygame.shared.eventbus.DomainEventHandler
import io.github.smiley4.strategygame.shared.eventbus.ReadableEventBus
import kotlinx.coroutines.flow.filterIsInstance

class GameGenerationRequestedEventHandler(
    private val gameEngineService: GameEngineService,
    private val eventBus: ReadableEventBus
) : DomainEventHandler() {

    override suspend fun start() {
        eventBus.events
            .filterIsInstance<GameGenerationRequestedEvent>()
            .collect { gameEngineService.create(it.matchId, it.players) }
    }

}