package io.github.smiley4.strategygame.shared.domain.events

import io.github.smiley4.strategygame.shared.domain.MatchId
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.shared.eventbus.Event

class GameGenerationRequestedEvent(
    val matchId: MatchId,
    val players: Collection<UserId>
) : Event