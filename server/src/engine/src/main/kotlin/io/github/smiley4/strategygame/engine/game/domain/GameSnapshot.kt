package io.github.smiley4.strategygame.engine.game.domain

import io.github.smiley4.strategygame.engine.simulation.gamestate.PlayerCommand
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId

data class GameSnapshot(
    val id: GameId,
    val players: Set<UserId>,
    val pendingCommands: Map<UserId, List<PlayerCommand>>
)
