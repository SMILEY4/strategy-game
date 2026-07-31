package io.github.smiley4.strategygame.platform.match.eventhandler

import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.shared.events.GameCreatedEvent
import io.github.smiley4.strategygame.shared.eventbus.DomainEventHandler
import io.github.smiley4.strategygame.shared.eventbus.ReadableEventBus
import kotlinx.coroutines.flow.filterIsInstance

/**
 * Listens for [GameCreatedEvent] and attaches the game to its match.
 */
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