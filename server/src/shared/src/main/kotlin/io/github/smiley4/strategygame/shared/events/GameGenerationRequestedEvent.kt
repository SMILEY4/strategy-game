package io.github.smiley4.strategygame.shared.events

import io.github.smiley4.strategygame.shared.values.MatchId
import io.github.smiley4.strategygame.shared.values.UserId
import io.github.smiley4.strategygame.shared.eventbus.Event

class GameGenerationRequestedEvent(
    val matchId: MatchId,
    val players: Collection<UserId>
) : Event