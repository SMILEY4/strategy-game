package io.github.smiley4.strategygame.shared.domain.events

import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.eventbus.DomainEvent

data class MatchDeletedEvent(
    val gameId: GameId?
) : DomainEvent