package io.github.smiley4.strategygame.engine.game.domain

import io.github.smiley4.strategygame.engine.shared.PlayerCommand
import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId

data class GameSnapshot(
    val id: GameId,
    val players: Set<UserId>,
    val currentTurn: Int,
    val pendingCommands: Map<UserId, List<PlayerCommand>>
)
