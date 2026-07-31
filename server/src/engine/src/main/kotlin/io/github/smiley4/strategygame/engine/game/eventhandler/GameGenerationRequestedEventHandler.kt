package io.github.smiley4.strategygame.engine.game.eventhandler

import io.github.smiley4.strategygame.engine.game.GameService
import io.github.smiley4.strategygame.shared.events.GameGenerationRequestedEvent
import io.github.smiley4.strategygame.shared.eventbus.DomainEventHandler
import io.github.smiley4.strategygame.shared.eventbus.ReadableEventBus
import kotlinx.coroutines.flow.filterIsInstance

/**
 * Listens for [GameGenerationRequestedEvent] and triggers game creation.
 */
class GameGenerationRequestedEventHandler(
    private val gameService: GameService,
    private val eventBus: ReadableEventBus
) : DomainEventHandler() {

    override suspend fun start() {
        eventBus.events
            .filterIsInstance<GameGenerationRequestedEvent>()
            .collect { gameService.create(it.matchId, it.players) }
    }

}