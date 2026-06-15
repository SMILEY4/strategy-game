package io.github.smiley4.strategygame.shared.events

import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.eventbus.Event

data class MatchDeletedEvent(
    val gameId: GameId?
) : Event