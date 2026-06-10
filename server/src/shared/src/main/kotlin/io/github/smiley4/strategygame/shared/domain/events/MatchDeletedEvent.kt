package io.github.smiley4.strategygame.shared.domain.events

import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.eventbus.Event

data class MatchDeletedEvent(
    val gameId: GameId?
) : Event