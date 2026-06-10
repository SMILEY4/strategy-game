package io.github.smiley4.strategygame.shared.domain.events

import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.MatchId
import io.github.smiley4.strategygame.shared.eventbus.DomainEvent

class GameCreatedEvent( // todo: should this be here in shared?  DOMAIN vs INTEGRATION events!!
    val matchId: MatchId,
    val gameId: GameId,
) : DomainEvent