package io.github.smiley4.strategygame.platform.match.domain

import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.shared.domain.events.GameCreatedEvent
import io.github.smiley4.strategygame.shared.eventbus.DomainEventHandler
import io.github.smiley4.strategygame.shared.eventbus.ReadableEventBus
import kotlinx.coroutines.flow.filterIsInstance

internal class GameCreatedEventHandler(
    private val eventBus: ReadableEventBus,
    private val matchService: MatchService,
) : DomainEventHandler() {

    override suspend fun start() {
        eventBus.events
            .filterIsInstance<GameCreatedEvent>()
            .collect { matchService.attachGame(it.matchId, it.gameId) }
    }
}