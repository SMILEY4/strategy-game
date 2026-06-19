package io.github.smiley4.strategygame.engine.game.eventhandler

import io.github.smiley4.strategygame.engine.game.GameService
import io.github.smiley4.strategygame.shared.events.MatchDeletedEvent
import io.github.smiley4.strategygame.shared.eventbus.DomainEventHandler
import io.github.smiley4.strategygame.shared.eventbus.ReadableEventBus
import kotlinx.coroutines.flow.filterIsInstance
import kotlinx.coroutines.flow.mapNotNull

class MatchDeletedEventHandler(
    private val gameService: GameService,
    private val eventBus: ReadableEventBus
) : DomainEventHandler() {

    override suspend fun start() {
        eventBus.events
            .filterIsInstance<MatchDeletedEvent>()
            .mapNotNull { it.gameId }
            .collect { gameService.delete(it) }
    }

}