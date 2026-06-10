package io.github.smiley4.strategygame.engine.game.domain

import io.github.smiley4.strategygame.engine.game.GameEngineService
import io.github.smiley4.strategygame.engine.gameplay.events.PlayerGameStateEvent
import io.github.smiley4.strategygame.shared.domain.events.GameGenerationRequestedEvent
import io.github.smiley4.strategygame.shared.eventbus.DomainEventHandler
import io.github.smiley4.strategygame.shared.eventbus.ReadableEventBus
import kotlinx.coroutines.flow.filterIsInstance

class PlayerGameStateEventHandler(
    private val gameEngineService: GameEngineService,
    private val eventBus: ReadableEventBus
) : DomainEventHandler() {

    override suspend fun start() {
        eventBus.events
            .filterIsInstance<PlayerGameStateEvent>()
            .collect { TODO("send via game notification service") }
        // todo: this event could also be handled by platform?
    }

}