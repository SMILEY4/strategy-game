package io.github.smiley4.strategygame.platform.game.domain

import io.github.smiley4.strategygame.identity.user.domain.UserId

internal data class GameSnapshot(
    val id: GameId,
    val name: String,
    val members: List<GameMemberSnapshot>,
)

internal data class GameMemberSnapshot(
    val userId: UserId,
    val role: PlayerRole,
)