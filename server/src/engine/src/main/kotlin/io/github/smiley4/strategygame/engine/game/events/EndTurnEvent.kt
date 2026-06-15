package io.github.smiley4.strategygame.engine.game.events

import io.github.smiley4.strategygame.engine.shared.PlayerCommand
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.eventbus.Event
import io.github.smiley4.strategygame.shared.values.UserId

class EndTurnEvent(
    val gameId: GameId,
    val turn: Int,
    val connectedPlayers: Collection<UserId>,
    val commands: List<PlayerCommand>
) : Event