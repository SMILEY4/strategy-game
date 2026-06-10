package io.github.smiley4.strategygame.engine.gameplay.events

import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.shared.eventbus.Event

data class PlayerGameStateEvent(
    val gameId: GameId,
    val player: UserId,
    val state: String
): Event