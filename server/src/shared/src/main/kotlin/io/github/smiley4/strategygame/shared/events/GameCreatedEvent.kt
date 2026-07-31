package io.github.smiley4.strategygame.shared.events

import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.MatchId
import io.github.smiley4.strategygame.shared.eventbus.Event

/**
 * Emitted after a game has been created for a match.
 */
class GameCreatedEvent(
    val matchId: MatchId,
    val gameId: GameId,
) : Event