package io.github.smiley4.strategygame.shared.events

import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.eventbus.Event

/**
 * Emitted after a match has been deleted. Carries the attached game id, if any.
 */
data class MatchDeletedEvent(
    val gameId: GameId?
) : Event