package io.github.smiley4.strategygame.shared.domain.events

import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.MatchId
import io.github.smiley4.strategygame.shared.eventbus.Event

class GameCreatedEvent(
    val matchId: MatchId,
    val gameId: GameId,
) : Event