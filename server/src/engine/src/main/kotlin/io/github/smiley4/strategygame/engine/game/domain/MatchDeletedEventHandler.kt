package io.github.smiley4.strategygame.engine.game.domain

import io.github.smiley4.strategygame.engine.game.GameEngineService
import io.github.smiley4.strategygame.shared.domain.events.GameGenerationRequestedEvent
import io.github.smiley4.strategygame.shared.domain.events.MatchDeletedEvent
import io.github.smiley4.strategygame.shared.eventbus.DomainEventHandler
import io.github.smiley4.strategygame.shared.eventbus.ReadableEventBus
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.filterIsInstance
import kotlinx.coroutines.flow.mapNotNull

class MatchDeletedEventHandler(
    private val gameEngineService: GameEngineService,
    private val eventBus: ReadableEventBus
) : DomainEventHandler() {

    override suspend fun start() {
        eventBus.events
            .filterIsInstance<MatchDeletedEvent>()
            .mapNotNull { it.gameId }
            .collect { gameEngineService.delete(it) }
    }

}