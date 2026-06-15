package io.github.smiley4.strategygame.engine.gameplay.eventhandler

import io.github.smiley4.strategygame.engine.game.events.EndTurnEvent
import io.github.smiley4.strategygame.engine.gameplay.GameplayEngine
import io.github.smiley4.strategygame.shared.eventbus.DomainEventHandler
import io.github.smiley4.strategygame.shared.eventbus.ReadableEventBus
import kotlinx.coroutines.flow.filterIsInstance

class EndTurnEventHandler(
    private val gameplayService: GameplayEngine,
    private val eventBus: ReadableEventBus
) : DomainEventHandler() {

    override suspend fun start() {
        eventBus.events
            .filterIsInstance<EndTurnEvent>()
            .collect { gameplayService.processTurn(it.gameId, it.commands) }
    }

}