package io.github.smiley4.strategygame.engine.game.eventhandler

import io.github.smiley4.strategygame.engine.game.domain.GameNotificationService
import io.github.smiley4.strategygame.engine.gameplay.events.PlayerGameStateEvent
import io.github.smiley4.strategygame.shared.eventbus.DomainEventHandler
import io.github.smiley4.strategygame.shared.eventbus.ReadableEventBus
import kotlinx.coroutines.flow.filterIsInstance

internal class PlayerGameStateEventHandler(
    private val notificationService: GameNotificationService,
    private val eventBus: ReadableEventBus,
) : DomainEventHandler() {

    override suspend fun start() {
        // todo: this event could also be handled by platform?
        eventBus.events
            .filterIsInstance<PlayerGameStateEvent>()
            .collect { notificationService.send(it.gameId, it.player, it.state) }
    }

}