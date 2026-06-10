package io.github.smiley4.strategygame.engine.game.events

import io.github.smiley4.strategygame.engine.shared.PlayerCommand
import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.eventbus.Event

class EndTurnEvent(
    val gameId: GameId,
    val commands: List<PlayerCommand>
) : Event