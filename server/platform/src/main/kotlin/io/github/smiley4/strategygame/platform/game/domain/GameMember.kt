package io.github.smiley4.strategygame.platform.game.domain

import io.github.smiley4.strategygame.identity.user.domain.UserId

class GameMember(
    val user: UserId,
    val role: PlayerRole,
)

enum class PlayerRole { OWNER, GUEST }